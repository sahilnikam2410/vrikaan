import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { Section, Aurora, Card, T, alpha } from "../../components/ui";

// Lightweight translated marketing landings for major Indian languages.
// Machine-assisted translations — native review recommended before heavy promo.
const L = {
  ta: {
    name: "தமிழ்", langTag: "ta-IN",
    hero: ["மோசடி செய்பவர்கள் தாக்குகிறார்கள்.", "எங்கள் AI பதிலடி தருகிறது."],
    sub: "ஒவ்வொரு இந்தியக் குடும்பத்திற்கும் AI சைபர் பாதுகாப்பு. மோசடி செய்தியை ஒட்டுங்கள் — நொடிகளில் அது மோசடியா என்று சொல்கிறோம். இலவசம்.",
    cta: "இலவசமாகத் தொடங்குங்கள்", cta2: "மோசடியைச் சரிபார்க்க",
    props: [["🎭 AI ஸ்காம்பெய்டர்", "மோசடிக்காரரின் நேரத்தை வீணாக்கி, அவர்களின் UPI ஐடி & எண்களைச் சேகரிக்கிறது."], ["🧬 ஸ்காம் DNA", "ஒரு புகார் அனைவரையும் காக்கிறது — கூட்டு பாதுகாப்பு வலையமைப்பு."], ["⚡ 35+ இலவச கருவிகள்", "டீப்ஃபேக் கண்டறிதல், UPI & கடன் ஆப் சரிபார்ப்பு, ஆதார் மறைப்பு."]],
    note: "இந்தியாவில் உருவாக்கப்பட்டது 🇮🇳 · 1930 / cybercrime.gov.in இல் புகார் செய்யுங்கள்",
  },
  te: {
    name: "తెలుగు", langTag: "te-IN",
    hero: ["మోసగాళ్లు దాడి చేస్తారు.", "మా AI ఎదురుదాడి చేస్తుంది."],
    sub: "ప్రతి భారతీయ కుటుంబానికి AI సైబర్ రక్షణ. మోసపు సందేశాన్ని అతికించండి — క్షణాల్లో అది మోసమా అని చెబుతాం. ఉచితం.",
    cta: "ఉచితంగా ప్రారంభించండి", cta2: "మోసాన్ని తనిఖీ చేయండి",
    props: [["🎭 AI స్కామ్‌బెయిటర్", "మోసగాడి సమయాన్ని వృథా చేసి, వారి UPI ID & నంబర్లను సేకరిస్తుంది."], ["🧬 స్కామ్ DNA", "ఒక్క నివేదిక అందరినీ కాపాడుతుంది — సామూహిక రక్షణ నెట్‌వర్క్."], ["⚡ 35+ ఉచిత సాధనాలు", "డీప్‌ఫేక్ గుర్తింపు, UPI & లోన్-యాప్ తనిఖీ, ఆధార్ మాస్క్."]],
    note: "భారతదేశంలో తయారు చేయబడింది 🇮🇳 · 1930 / cybercrime.gov.in లో ఫిర్యాదు చేయండి",
  },
  mr: {
    name: "मराठी", langTag: "mr-IN",
    hero: ["फसवणूक करणारे हल्ला करतात.", "आमचा AI प्रत्युत्तर देतो."],
    sub: "प्रत्येक भारतीय कुटुंबासाठी AI सायबर संरक्षण. फसवा संदेश पेस्ट करा — काही सेकंदात तो घोटाळा आहे का ते सांगतो. मोफत.",
    cta: "मोफत सुरू करा", cta2: "घोटाळा तपासा",
    props: [["🎭 AI स्कॅमबेटर", "फसवणूक करणाऱ्याचा वेळ वाया घालवते आणि त्यांचे UPI आयडी व नंबर गोळा करते."], ["🧬 स्कॅम DNA", "एक तक्रार सर्वांचे रक्षण करते — सामूहिक संरक्षण नेटवर्क."], ["⚡ 35+ मोफत साधने", "डीपफेक ओळख, UPI व लोन-अॅप तपासणी, आधार मास्क."]],
    note: "भारतात बनवले 🇮🇳 · 1930 / cybercrime.gov.in वर तक्रार करा",
  },
  bn: {
    name: "বাংলা", langTag: "bn-IN",
    hero: ["প্রতারকরা আক্রমণ করে.", "আমাদের AI পাল্টা লড়াই করে."],
    sub: "প্রতিটি ভারতীয় পরিবারের জন্য AI সাইবার সুরক্ষা. প্রতারণার বার্তা পেস্ট করুন — সেকেন্ডেই বলে দেবে এটি প্রতারণা কিনা. বিনামূল্যে.",
    cta: "বিনামূল্যে শুরু করুন", cta2: "প্রতারণা যাচাই করুন",
    props: [["🎭 AI স্ক্যামবেটার", "প্রতারকের সময় নষ্ট করে এবং তাদের UPI আইডি ও নম্বর সংগ্রহ করে।"], ["🧬 স্ক্যাম DNA", "একটি রিপোর্ট সবাইকে রক্ষা করে — সম্মিলিত সুরক্ষা নেটওয়ার্ক।"], ["⚡ 35+ বিনামূল্যের টুল", "ডিপফেক শনাক্ত, UPI ও লোন-অ্যাপ যাচাই, আধার মাস্ক।"]],
    note: "ভারতে তৈরি 🇮🇳 · 1930 / cybercrime.gov.in-এ রিপোর্ট করুন",
  },
};

export default function RegionalLanding({ lang = "ta" }) {
  const d = L[lang] || L.ta;
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <SEO
        title={`VRIKAAN — ${d.hero[0]} ${d.hero[1]}`}
        description={d.sub}
        path={`/${lang}`}
      />
      <Navbar />
      <Aurora />
      <Section style={{ paddingTop: 130, textAlign: "center", maxWidth: 920 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 100, border: `1px solid ${alpha(T.cyan, 0.35)}`, background: alpha(T.cyan, 0.08), color: T.cyan, fontSize: 14, fontWeight: 700, marginBottom: 22 }}>🐺 VRIKAAN · {d.name}</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,5vw,56px)", color: T.white, margin: 0, lineHeight: 1.1 }}>
          {d.hero[0]}<br /><span style={{ color: T.cyan }}>{d.hero[1]}</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 17, lineHeight: 1.7, maxWidth: 720, margin: "20px auto 0" }}>{d.sub}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
          <Link to="/signup" style={btn(T.cyan, true)}>{d.cta}</Link>
          <Link to="/scam-dna" style={btn(T.accent, false)}>{d.cta2}</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginTop: 48, textAlign: "left" }}>
          {d.props.map((p, i) => (
            <Card key={i} style={{ padding: 22 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.white, marginBottom: 8 }}>{p[0]}</div>
              <div style={{ color: T.muted, fontSize: 14.5, lineHeight: 1.6 }}>{p[1]}</div>
            </Card>
          ))}
        </div>

        <div style={{ color: T.mutedDark, fontSize: 13.5, marginTop: 40 }}>{d.note}</div>
        <div style={{ marginTop: 14 }}>
          <Link to="/" style={{ color: T.muted, fontSize: 13, textDecoration: "none" }}>English ↗</Link>
        </div>
      </Section>
      <Footer />
    </div>
  );
}
const btn = (col, solid) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 26px", borderRadius: 12, background: solid ? col : alpha(col, 0.12), border: `1px solid ${alpha(col, solid ? 1 : 0.4)}`, color: solid ? "#04110e" : col, fontWeight: 800, fontSize: 16, textDecoration: "none" });
