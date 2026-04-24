import { useEffect, useState, useRef } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import {
  articles,
  getArticleBySlug,
  getRelatedArticles,
  slugify,
  categoryColors,
  categoryGradients,
  T,
} from "./Blog";

export default function BlogPost() {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);
  const [activeSection, setActiveSection] = useState(0);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  // Scroll-spy for TOC
  useEffect(() => {
    if (!article || !contentRef.current) return;
    const handleScroll = () => {
      const sections = contentRef.current?.querySelectorAll("[data-section]");
      if (!sections) return;
      let current = 0;
      sections.forEach((sec, i) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 200) current = i;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article]);

  if (!article) return <Navigate to="/blog" replace />;

  const catColor = categoryColors[article.category] || T.cyan;
  const grad = categoryGradients[article.category] || categoryGradients.News;
  const related = getRelatedArticles(article);
  const url = `https://vrikaan.com/blog/${slug}`;

  const scrollToSection = (i) => {
    const sections = contentRef.current?.querySelectorAll("[data-section]");
    if (sections && sections[i]) sections[i].scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.title)}`, "_blank", "noopener");
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener");

  // Article JSON-LD schema (Google rich results)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.excerpt,
      image: `https://vrikaan.com/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}`,
      datePublished: article.date,
      dateModified: article.date,
      author: { "@type": "Person", name: article.author.name },
      publisher: {
        "@type": "Organization",
        name: "VRIKAAN",
        logo: { "@type": "ImageObject", url: "https://vrikaan.com/favicon.svg" },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      keywords: article.tags.join(", "),
      articleSection: article.category,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://vrikaan.com" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://vrikaan.com/blog" },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: T.white }}>
      <SEO
        title={article.title}
        description={article.excerpt}
        path={`/blog/${slug}`}
        image={`https://vrikaan.com/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(article.category)}`}
        keywords={article.tags.join(", ")}
        type="article"
        jsonLd={jsonLd}
      />
      <Navbar />

      <style>{`
        @media (max-width: 1024px) { .bp-sidebar { display: none !important; } .bp-main { max-width: 100% !important; } }
        @media (max-width: 640px) { .bp-title { font-size: 28px !important; } .bp-hero { height: 200px !important; } }
      `}</style>

      {/* Hero banner */}
      <div style={{ position: "relative", marginTop: 0 }}>
        <div className="bp-hero" style={{
          background: grad, height: 320, display: "flex", alignItems: "flex-end",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 40%, ${catColor}20, transparent 60%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", padding: "0 24px 28px", position: "relative", zIndex: 1 }}>
            <Link to="/blog" style={{
              display: "inline-flex", alignItems: "center", gap: 6, color: T.muted,
              fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 14,
              padding: "6px 12px", borderRadius: 8, background: "rgba(0,0,0,0.3)",
              border: `1px solid ${T.border}`, backdropFilter: "blur(8px)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* Main content */}
          <article className="bp-main" style={{ flex: 1, maxWidth: 780 }} ref={contentRef}>
            {/* Meta bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: `${catColor}20`, color: catColor, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {article.category}
              </span>
              <span style={{ fontSize: 13, color: T.mutedDark }}>{article.date}</span>
              <span style={{ fontSize: 13, color: T.mutedDark }}>·</span>
              <span style={{ fontSize: 13, color: T.mutedDark }}>{article.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="bp-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 800, color: T.white, margin: "0 0 20px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              {article.title}
            </h1>

            {/* Excerpt */}
            <p style={{ fontSize: 17, color: T.muted, lineHeight: 1.7, margin: "0 0 28px" }}>{article.excerpt}</p>

            {/* Author + share */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${article.author.color}20`, border: `2px solid ${article.author.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: article.author.color, fontFamily: "'Space Grotesk'" }}>
                  {article.author.initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.white }}>{article.author.name}</div>
                  <div style={{ fontSize: 12, color: T.mutedDark }}>{article.date} · {article.readTime}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={shareTwitter} style={shareBtn}>X / Twitter</button>
                <button onClick={shareLinkedIn} style={shareBtn}>LinkedIn</button>
                <button onClick={copyLink} style={shareBtn}>{copied ? "Copied!" : "Copy Link"}</button>
              </div>
            </div>

            {/* Mobile TOC */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 32 }} className="bp-toc-mobile">
              <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: T.mutedDark, margin: "0 0 12px", letterSpacing: 1, textTransform: "uppercase" }}>
                Table of Contents
              </h4>
              {article.content.map((sec, i) => (
                <div
                  key={i}
                  onClick={() => scrollToSection(i)}
                  style={{
                    fontSize: 13,
                    color: activeSection === i ? T.cyan : T.muted,
                    padding: "6px 0 6px 14px",
                    borderLeft: `2px solid ${activeSection === i ? T.cyan : T.border}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: 2,
                    fontWeight: activeSection === i ? 600 : 400,
                  }}
                >
                  {sec.heading}
                </div>
              ))}
            </div>

            {/* Sections */}
            {article.content.map((section, i) => (
              <section key={i} data-section={i} style={{ marginBottom: 36 }}>
                <h2 style={{ fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 700, color: T.white, margin: "0 0 14px", paddingTop: 8, letterSpacing: "-0.01em" }}>
                  {section.heading}
                </h2>
                <p style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.8, margin: 0 }}>{section.text}</p>
              </section>
            ))}

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "24px 0", borderTop: `1px solid ${T.border}` }}>
              {article.tags.map((tag) => (
                <span key={tag} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${T.accent}15`, color: T.accent, border: `1px solid ${T.accent}20` }}>
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author bio card */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, marginTop: 12, marginBottom: 48, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${article.author.color}20`, border: `2px solid ${article.author.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: article.author.color, fontFamily: "'Space Grotesk'", flexShrink: 0 }}>
                {article.author.initials}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDark, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Written by</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.white, fontFamily: "'Space Grotesk'", marginBottom: 8 }}>{article.author.name}</div>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, margin: 0 }}>{article.author.bio}</p>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              background: `linear-gradient(135deg, ${T.accent}18 0%, ${T.cyan}10 100%)`,
              border: `1px solid ${T.accent}30`, borderRadius: 16, padding: "28px 32px",
              marginBottom: 48, textAlign: "center",
            }}>
              <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 700, color: T.white, margin: "0 0 10px" }}>
                Protect yourself with VRIKAAN
              </h3>
              <p style={{ fontSize: 14, color: T.muted, margin: "0 0 18px", lineHeight: 1.6 }}>
                Check for breaches, scan for threats, and get AI-powered fraud analysis — all free.
              </p>
              <Link to="/signup" style={{
                display: "inline-block", padding: "11px 28px",
                background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                color: "#fff", borderRadius: 10, textDecoration: "none",
                fontSize: 14, fontWeight: 700,
                boxShadow: `0 8px 24px ${T.accent}30`,
              }}>
                Get started free →
              </Link>
            </div>

            {/* Related articles */}
            {related.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Space Grotesk'", fontSize: 22, fontWeight: 700, color: T.white, marginBottom: 20 }}>
                  Related Articles
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                  {related.map((a) => {
                    const rCat = categoryColors[a.category] || T.cyan;
                    const rGrad = categoryGradients[a.category] || categoryGradients.News;
                    return (
                      <Link key={a.id} to={`/blog/${slugify(a.title)}`} style={{
                        textDecoration: "none", background: T.card,
                        border: `1px solid ${T.border}`, borderRadius: 14,
                        overflow: "hidden", display: "flex", flexDirection: "column",
                        transition: "transform 0.2s, border-color 0.2s",
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = rCat + "40"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = T.border; }}
                      >
                        <div style={{ background: rGrad, height: 100, position: "relative" }}>
                          <span style={{ position: "absolute", top: 10, left: 10, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${rCat}25`, color: rCat, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {a.category}
                          </span>
                        </div>
                        <div style={{ padding: 16, flex: 1 }}>
                          <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 14, fontWeight: 700, color: T.white, margin: "0 0 6px", lineHeight: 1.4 }}>
                            {a.title}
                          </h4>
                          <div style={{ fontSize: 11, color: T.mutedDark }}>{a.readTime}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          {/* Desktop sidebar TOC */}
          <aside className="bp-sidebar" style={{ width: 220, flexShrink: 0, position: "sticky", top: 100, alignSelf: "flex-start" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
              <h4 style={{ fontFamily: "'Space Grotesk'", fontSize: 13, fontWeight: 700, color: T.mutedDark, margin: "0 0 14px", letterSpacing: 1, textTransform: "uppercase" }}>Contents</h4>
              {article.content.map((sec, i) => (
                <div
                  key={i}
                  onClick={() => scrollToSection(i)}
                  style={{
                    fontSize: 12,
                    color: activeSection === i ? T.cyan : T.muted,
                    padding: "6px 0 6px 12px",
                    borderLeft: `2px solid ${activeSection === i ? T.cyan : T.border}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: 2,
                    fontWeight: activeSection === i ? 600 : 400,
                  }}
                >
                  {sec.heading}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const shareBtn = {
  background: "rgba(17,24,39,0.6)",
  border: "1px solid rgba(148,163,184,0.08)",
  borderRadius: 8,
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 600,
  padding: "6px 14px",
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: "all 0.2s",
};
