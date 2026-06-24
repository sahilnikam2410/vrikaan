import { useState } from "react";
import { Link } from "react-router-dom";
import { LuShirt, LuQrCode, LuPackage, LuShoppingBag, LuX } from "react-icons/lu";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

const SAFFRON = "#f97316";
const PRODUCTS = [
  { id: "tee-fightback", icon: LuShirt, name: "“Our AI Fights Back” Tee", price: 599, tag: "Bestseller", color: T.cyan, desc: "Black cotton tee, wolf mark + tagline. Wear the mission." },
  { id: "tee-kumbh", icon: LuShirt, name: "Simhastha 2027 Pilgrim Tee", price: 499, tag: "Kumbh", color: SAFFRON, desc: "Saffron edition for Nashik Kumbh. कुंभ कवच print." },
  { id: "band-kavach", icon: LuQrCode, name: "Kumbh Kavach QR Band", price: 50, tag: "Safety", color: SAFFRON, desc: "Scannable safety wristband — lost-&-found + family contact." },
  { id: "cap-wolf", icon: LuShoppingBag, name: "VRIKAAN Wolf Cap", price: 399, tag: "New", color: T.accent, desc: "Embroidered wolf hexagon. Teal on black." },
  { id: "kit-pilgrim", icon: LuPackage, name: "Pilgrim Safety Kit", price: 299, tag: "Kumbh", color: SAFFRON, desc: "Kavach band + tote + safety card + sticker. Family-ready." },
  { id: "sticker-pack", icon: LuPackage, name: "Scam-DNA Sticker Pack", price: 149, tag: "", color: T.accent, desc: "8 vinyl stickers — wolf, Scam DNA, 1930 helpline." },
];

export default function Store() {
  const [cart, setCart] = useState(null); // selected product for pre-order
  const [f, setF] = useState({ name: "", phone: "", size: "M", qty: 1 });
  const [sent, setSent] = useState(false);

  const order = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !/\d{10}/.test(f.phone.replace(/\D/g, ""))) return;
    try {
      await fetch("/api/tools?tool=enterprise-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(), email: `${f.phone.replace(/\D/g, "")}@store.vrikaan`,
          company: `Store pre-order — ${cart.name}`, role: "Customer", tier: "merch",
          message: `Product: ${cart.name} (₹${cart.price}) · Size ${f.size} · Qty ${f.qty} · Phone ${f.phone}`,
        }),
      });
    } catch { /* */ }
    setSent(true);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO title="VRIKAAN Store — Tees, Kumbh Kavach Bands & Merch" description="Wear the mission. VRIKAAN tees, caps, Simhastha 2027 Kumbh pilgrim gear & QR safety bands. Made in India." path="/store" />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 120, textAlign: "center", maxWidth: 1100 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 14, fontWeight: 700, marginBottom: 20 }}><LuShoppingBag size={15} /> VRIKAAN Store</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,52px)", color: T.white, margin: 0 }}>Wear the mission. 🐺</h1>
        <p style={{ color: T.muted, fontSize: 16, marginTop: 12, maxWidth: 640, marginInline: "auto" }}>Tees, caps, Kumbh pilgrim gear & QR safety bands. Print-on-demand — pre-order now, ships pan-India.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, marginTop: 34, textAlign: "left" }}>
          {PRODUCTS.map((pr) => {
            const Ic = pr.icon;
            return (
              <Card key={pr.id} style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: 190, position: "relative", overflow: "hidden", background: "#070b14" }}>
                  <img src={`/store/${pr.id}.png`} alt={pr.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {pr.tag && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 11, fontWeight: 700, color: pr.color, background: alpha(pr.color, 0.2), border: `1px solid ${alpha(pr.color, 0.5)}`, padding: "4px 10px", borderRadius: 100, backdropFilter: "blur(4px)" }}>{pr.tag}</span>}
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: T.white }}>{pr.name}</div>
                  <div style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 12px", minHeight: 38 }}>{pr.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: T.white }}>₹{pr.price}</span>
                    <button onClick={() => { setCart(pr); setSent(false); setF({ name: "", phone: "", size: "M", qty: 1 }); }} style={{ padding: "9px 18px", borderRadius: 10, background: pr.color, border: "none", color: "#04110e", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>Pre-order</button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <p style={{ color: T.mutedDark, fontSize: 13, marginTop: 28 }}>Bulk / akhada / corporate orders → <a href="mailto:hello@vrikaan.com" style={{ color: T.cyan }}>hello@vrikaan.com</a> · Made in India 🇮🇳</p>
      </Section>

      {/* pre-order modal (in-flow faux overlay) */}
      {cart && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(3,7,18,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setCart(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px,100%)", background: "#0b1220", border: `1px solid ${alpha(cart.color, 0.4)}`, borderRadius: 18, padding: 26, position: "relative" }}>
            <button onClick={() => setCart(null)} style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", cursor: "pointer" }}><LuX size={20} color={T.muted} /></button>
            {sent ? (
              <div style={{ textAlign: "center", padding: 10 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🐺</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.white }}>Pre-order placed!</div>
                <p style={{ color: T.muted, fontSize: 14, marginTop: 8 }}>We'll WhatsApp you to confirm <b style={{ color: T.white }}>{cart.name}</b> + payment + delivery. Thank you!</p>
                <button onClick={() => setCart(null)} style={{ marginTop: 16, padding: "10px 22px", borderRadius: 10, background: alpha(T.cyan, 0.12), border: `1px solid ${alpha(T.cyan, 0.4)}`, color: T.cyan, fontWeight: 700, cursor: "pointer" }}>Keep shopping</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: cart.color, fontWeight: 700, marginBottom: 4 }}>PRE-ORDER · ₹{cart.price}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 16 }}>{cart.name}</div>
                <form onSubmit={order} style={{ display: "grid", gap: 12 }}>
                  <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name *" style={inp} />
                  <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="WhatsApp number (10-digit) *" style={inp} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <select value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} style={{ ...inp, flex: 1 }}>{["S", "M", "L", "XL", "XXL", "N/A"].map((s) => <option key={s} style={{ background: "#0b1220" }}>{s}</option>)}</select>
                    <select value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} style={{ ...inp, flex: 1 }}>{[1, 2, 3, 4, 5].map((q) => <option key={q} style={{ background: "#0b1220" }}>{q}</option>)}</select>
                  </div>
                  <button type="submit" style={{ padding: "13px", borderRadius: 10, background: cart.color, border: "none", color: "#04110e", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Place pre-order →</button>
                  <p style={{ color: T.mutedDark, fontSize: 11.5, textAlign: "center", margin: 0 }}>No payment now — we confirm price, size & delivery on WhatsApp.</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
const inp = { padding: "12px 14px", borderRadius: 10, background: alpha("#94a3b8", 0.06), border: `1px solid ${alpha("#94a3b8", 0.2)}`, color: "#f1f5f9", fontSize: 15, outline: "none" };
