// Thin wrapper over Datadog RUM custom actions. Lets us record product-funnel
// events (scam check, warn-family share, signup, purchase) so Datadog shows
// conversions, not just pageviews. No-op when RUM isn't active (keys absent,
// dev/preview, or adblocked) — DD_RUM is the global the SDK installs on init.
export function track(name, context = {}) {
  try {
    window.DD_RUM?.addAction?.(name, context);
  } catch {
    /* analytics is best-effort — never throw */
  }
}
