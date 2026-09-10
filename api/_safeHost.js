/**
 * Outbound-fetch guard for user-supplied hostnames.
 * --------------------------------------------------------------
 * Any endpoint that fetches a host the caller chose is an SSRF pivot
 * unless the resolved address is checked. VRIKAAN's SSL grader did
 * exactly that — `fetch("https://" + domain)` with no validation —
 * which turned the tool that grades other people's TLS into an
 * unauthenticated reachability probe for the function's own network.
 *
 * Two things have to be true, and only checking the first is the
 * classic mistake:
 *   1. the hostname is a public name, and
 *   2. every address it resolves to is a public address.
 *
 * Redirects re-open the hole, so callers must use redirect: "manual"
 * and re-validate any Location they intend to follow.
 *
 * Underscore-prefixed so Vercel does not expose it as a function.
 */
import dns from "dns/promises";
import net from "net";

/** Hostnames that never belong to a public site. */
const BLOCKED_NAMES = new Set([
  "localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback",
  "metadata", "metadata.google.internal", "instance-data",
]);

/** Suffixes reserved for internal or non-routable use (RFC 6761/8375). */
const BLOCKED_SUFFIXES = [
  ".local", ".localhost", ".internal", ".intranet", ".corp", ".home",
  ".lan", ".private", ".test", ".example", ".invalid", ".home.arpa",
];

function ipv4IsPrivate(ip) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  if (a === 0) return true;                              // 0.0.0.0/8 "this network"
  if (a === 10) return true;                             // private
  if (a === 127) return true;                            // loopback
  if (a === 169 && b === 254) return true;               // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;      // private
  if (a === 192 && b === 168) return true;               // private
  if (a === 192 && b === 0) return true;                 // IETF protocol assignments
  if (a === 192 && b === 88) return true;                // 6to4 relay anycast
  if (a === 198 && (b === 18 || b === 19)) return true;  // benchmarking
  if (a === 198 && b === 51) return true;                // TEST-NET-2
  if (a === 203 && b === 0) return true;                 // TEST-NET-3
  if (a === 100 && b >= 64 && b <= 127) return true;     // CGNAT
  if (a >= 224) return true;                             // multicast + reserved + broadcast
  return false;
}

function ipv6IsPrivate(ip) {
  const s = ip.toLowerCase().split("%")[0]; // strip zone id
  if (s === "::" || s === "::1") return true;            // unspecified, loopback
  if (s.startsWith("fe80:")) return true;                // link-local
  if (s.startsWith("fc") || s.startsWith("fd")) return true; // unique local fc00::/7
  if (s.startsWith("ff")) return true;                   // multicast
  if (s.startsWith("2001:db8")) return true;             // documentation
  if (s.startsWith("64:ff9b:")) return true;             // NAT64
  // IPv4-mapped / -compatible (::ffff:169.254.169.254 reaches metadata)
  const mapped = /^::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (mapped) return ipv4IsPrivate(mapped[1]);
  return false;
}

/** True when an IP literal is anything other than a public unicast address. */
export function isPrivateAddress(ip) {
  const v = net.isIP(ip);
  if (v === 4) return ipv4IsPrivate(ip);
  if (v === 6) return ipv6IsPrivate(ip);
  return true; // not an IP at all → treat as unsafe
}

/**
 * Normalise caller input to a bare hostname.
 * Accepts "example.com", "https://example.com/path?q=1", "EXAMPLE.com.".
 * @returns {string|null}
 */
export function normalizeHost(input) {
  const raw = String(input || "").trim();
  if (!raw || raw.length > 253) return null;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    // Reject embedded credentials — "https://user@evil.tld" is a classic
    // way to make a validated string read as a different host later.
    if (u.username || u.password) return null;
    return u.hostname.replace(/\.$/, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Resolve `host` and confirm every address it maps to is public.
 *
 * @param {string} host bare hostname (run normalizeHost first)
 * @returns {Promise<{ ok: true, host: string, addresses: string[] } |
 *                   { ok: false, reason: string }>}
 */
export async function assertPublicHost(host) {
  if (!host) return { ok: false, reason: "invalid-host" };
  if (BLOCKED_NAMES.has(host)) return { ok: false, reason: "reserved-host" };
  if (BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) return { ok: false, reason: "reserved-suffix" };

  // A bare label with no dot is an intranet name, not a site.
  if (!host.includes(".") && net.isIP(host) === 0) return { ok: false, reason: "not-fqdn" };

  // IP literals skip DNS but still have to be public. Scanning a raw IP
  // is not a use case this tool has — the grade comes from the cert name.
  if (net.isIP(host)) {
    return isPrivateAddress(host)
      ? { ok: false, reason: "private-address" }
      : { ok: false, reason: "ip-literal-not-supported" };
  }

  let addresses;
  try {
    const records = await dns.lookup(host, { all: true, verbatim: true });
    addresses = records.map((r) => r.address);
  } catch {
    return { ok: false, reason: "dns-failed" };
  }
  if (!addresses.length) return { ok: false, reason: "dns-empty" };

  // ALL addresses must be public. One private answer in a round-robin
  // set is enough for a DNS-rebinding style pivot.
  const bad = addresses.find((a) => isPrivateAddress(a));
  if (bad) return { ok: false, reason: "private-address" };

  return { ok: true, host, addresses };
}

/** Human-readable reason, safe to return to the caller. */
export const HOST_REJECTION_MESSAGE = {
  "invalid-host": "That doesn't look like a valid hostname.",
  "reserved-host": "That hostname is reserved and can't be scanned.",
  "reserved-suffix": "Internal domains can't be scanned.",
  "not-fqdn": "Enter a full domain name, e.g. example.com.",
  "private-address": "That host resolves to a private address and can't be scanned.",
  "ip-literal-not-supported": "Enter a domain name rather than an IP address.",
  "dns-failed": "That domain didn't resolve.",
  "dns-empty": "That domain didn't resolve.",
};
