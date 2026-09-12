import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { T, categoryColors, categoryGradients, slugify, authors, articles, tags } from "./blogData";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [likedArticles, setLikedArticles] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredTag, setHoveredTag] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [autoPosts, setAutoPosts] = useState([]);

  // Auto-generated posts (weekly Gemini articles from Scam DNA trends).
  useEffect(() => {
    let on = true;
    fetch("/api/tools?tool=blog-list").then((r) => r.json()).then((d) => {
      if (!on || !Array.isArray(d.posts)) return;
      const mapped = d.posts.map((x, _i) => ({
        id: "auto_" + x.slug, title: x.title, slug: x.slug,
        category: x.category || "Threats", readTime: x.readTime || "5 min read",
        date: x.createdAtMs ? new Date(x.createdAtMs).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "",
        author: authors[0], excerpt: x.excerpt || "", likes: 0, comments: 0,
        tags: x.tags || [], featured: false, content: [],
      }));
      setAutoPosts(mapped);
    }).catch(() => {});
    return () => { on = false; };
  }, []);

  const categories = ["All", "News", "Tutorials", "Tips", "Threats", "Industry"];

  const filteredArticles = [...autoPosts, ...articles].filter((a) => {
    const matchesCat = activeCategory === "All" || a.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const gridArticles = filteredArticles.filter((a) => a !== featuredArticle);

  const popularArticles = [...articles].sort((a, b) => b.likes - a.likes).slice(0, 5);

  const toggleLike = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Article Card ───
  const ArticleCard = ({ article, large }) => {
    const isHovered = hoveredCard === article.id;
    const catColor = categoryColors[article.category] || T.cyan;
    const grad = categoryGradients[article.category] || categoryGradients.News;
    const liked = likedArticles[article.id];

    return (
      <Link
        to={`/blog/${slugify(article.title)}`}
        onMouseEnter={() => setHoveredCard(article.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          textDecoration: "none",
          background: T.card,
          border: `1px solid ${isHovered ? catColor + "40" : T.border}`,
          borderRadius: 16,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: isHovered ? `0 12px 40px ${catColor}15` : "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          ...(large ? { gridColumn: "1 / -1" } : {}),
        }}
      >
        {/* Image placeholder */}
        <div
          style={{
            background: grad,
            height: large ? 280 : 180,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Decorative elements */}
          <div style={{ position: "absolute", top: 20, right: 20, width: 60, height: 60, borderRadius: "50%", border: `2px solid ${catColor}30`, opacity: 0.5 }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${catColor}10` }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: large ? 48 : 32, opacity: 0.15, color: catColor }}>
            {article.category === "News" ? "\u{1F4F0}" : article.category === "Tutorials" ? "\u{1F4BB}" : article.category === "Tips" ? "\u{1F4A1}" : article.category === "Threats" ? "\u26A0\uFE0F" : "\u{1F3ED}"}
          </div>
          {/* Category badge */}
          <span
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              padding: "4px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              background: `${catColor}25`,
              color: catColor,
              backdropFilter: "blur(8px)",
              border: `1px solid ${catColor}30`,
              fontFamily: "'Vrikaan Sans'",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {article.category}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: large ? "24px 28px" : "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3
            style={{
              fontFamily: "'Vrikaan Sans'",
              fontSize: large ? 22 : 16,
              fontWeight: 700,
              color: T.white,
              margin: "0 0 8px 0",
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </h3>
          <p
            style={{
              fontFamily: "'Vrikaan Sans'",
              fontSize: 13,
              color: T.muted,
              margin: "0 0 16px 0",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: large ? 3 : 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {article.excerpt}
          </p>

          {/* Author + meta */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `${article.author.color}25`,
                  border: `2px solid ${article.author.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: article.author.color,
                  fontFamily: "'Vrikaan Sans'",
                }}
              >
                {article.author.initials}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.white, fontFamily: "'Vrikaan Sans'" }}>{article.author.name}</div>
                <div style={{ fontSize: 11, color: T.mutedDark, fontFamily: "'Vrikaan Sans'" }}>
                  {article.date} &middot; {article.readTime}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: T.mutedDark, fontFamily: "'Vrikaan Sans'" }}>
              <span onClick={(e) => toggleLike(article.id, e)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: liked ? T.red : T.mutedDark, transition: "color 0.2s" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? T.red : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {article.likes + (liked ? 1 : 0)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                {article.comments}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };


  // ─── Grid View ───
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Vrikaan Sans'" }}>
      <SEO title="Cybersecurity Blog - VRIKAAN" description="Stay informed with the latest cybersecurity news, tips, tutorials, and insights from industry experts." />
      <Navbar />

      {/* Inject responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .blog-main-grid { grid-template-columns: 1fr !important; }
          .blog-sidebar { display: none !important; }
          .blog-sidebar-mobile { display: block !important; }
          .blog-article-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .blog-article-grid { grid-template-columns: 1fr !important; }
          .blog-hero-title { font-size: 32px !important; }
          .blog-categories { gap: 6px !important; }
          .blog-categories button { font-size: 12px !important; padding: 6px 14px !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "110px 24px 0", textAlign: "center" }}>
        <div style={{ marginBottom: 12 }}>
          <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${T.cyan}12`, color: T.cyan, border: `1px solid ${T.cyan}20`, fontFamily: "'Vrikaan Sans'" }}>VRIKAAN Blog</span>
        </div>
        <h1
          className="blog-hero-title"
          style={{
            fontFamily: "'Vrikaan Sans'",
            fontSize: 48,
            fontWeight: 800,
            background: `linear-gradient(135deg, ${T.white} 0%, ${T.cyan} 50%, ${T.accent} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 16px 0",
            lineHeight: 1.1,
          }}
        >
          Cyber Security Blog
        </h1>
        <p style={{ fontSize: 17, color: T.muted, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Stay informed with the latest cybersecurity news, tips, and insights from our expert contributors.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 520, margin: "0 auto 28px", position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.mutedDark} strokeWidth="2" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "13px 16px 13px 44px",
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              color: T.white,
              fontSize: 14,
              outline: "none",
              fontFamily: "'Vrikaan Sans'",
              boxSizing: "border-box",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>

        {/* Category pills */}
        <div className="blog-categories" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 48 }}>
          {categories.map((cat) => {
            const active = activeCategory === cat;
            const catColor = cat === "All" ? T.cyan : categoryColors[cat] || T.cyan;
            const isHov = hoveredCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                onMouseEnter={() => setHoveredCategory(cat)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: active ? `1px solid ${catColor}60` : `1px solid ${T.border}`,
                  background: active ? `${catColor}18` : isHov ? `${catColor}08` : "transparent",
                  color: active ? catColor : isHov ? T.white : T.muted,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'Vrikaan Sans'",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="blog-main-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 36 }}>
        <div>
          {/* Featured article */}
          {featuredArticle && (
            <div style={{ marginBottom: 32 }}>
              <ArticleCard article={featuredArticle} large />
            </div>
          )}

          {/* Results count */}
          {(searchQuery || activeCategory !== "All") && (
            <p style={{ fontSize: 13, color: T.mutedDark, marginBottom: 16 }}>
              {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
              {searchQuery ? ` matching "${searchQuery}"` : ""}
            </p>
          )}

          {/* Article grid */}
          <div className="blog-article-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {gridArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>&#x1F50D;</div>
              <h3 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 20, color: T.white, marginBottom: 8 }}>No articles found</h3>
              <p style={{ fontSize: 14, color: T.muted }}>Try adjusting your search or category filter.</p>
            </div>
          )}

          {/* Mobile sidebar */}
          <div className="blog-sidebar-mobile" style={{ display: "none", marginTop: 40 }}>
            {/* Popular articles */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, marginBottom: 20 }}>
              <h4 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 16px 0" }}>Popular Articles</h4>
              {popularArticles.map((a, i) => (
                <Link
                  key={a.id}
                  to={`/blog/${slugify(a.title)}`}
                  style={{ textDecoration: "none", display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", cursor: "pointer", alignItems: "flex-start" }}
                >
                  <span style={{ fontFamily: "'Vrikaan Sans'", fontSize: 20, fontWeight: 800, color: `${T.cyan}30`, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.white, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: T.mutedDark }}>{a.likes} likes &middot; {a.readTime}</div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Tags */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22 }}>
              <h4 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 14px 0" }}>Tags</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setSearchQuery(tag.toLowerCase())}
                    style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: `${T.accent}10`, color: T.muted, cursor: "pointer", border: `1px solid ${T.border}`, transition: "all 0.2s" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="blog-sidebar" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Popular articles */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, backdropFilter: "blur(10px)" }}>
            <h4 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 16px 0" }}>Popular Articles</h4>
            {popularArticles.map((a, i) => (
              <Link
                key={a.id}
                to={`/blog/${slugify(a.title)}`}
                style={{ textDecoration: "none", display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", cursor: "pointer", alignItems: "flex-start", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{ fontFamily: "'Vrikaan Sans'", fontSize: 20, fontWeight: 800, color: `${T.cyan}30`, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.white, lineHeight: 1.4, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: T.mutedDark }}>{a.likes} likes &middot; {a.readTime}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ background: `linear-gradient(135deg, ${T.accent}15 0%, ${T.cyan}10 100%)`, border: `1px solid ${T.accent}25`, borderRadius: 14, padding: 22 }}>
            <h4 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 6px 0" }}>Newsletter</h4>
            <p style={{ fontSize: 12, color: T.muted, margin: "0 0 14px 0", lineHeight: 1.5 }}>Get the latest cybersecurity insights delivered to your inbox every week.</p>
            {newsletterSubmitted ? (
              <div style={{ fontSize: 13, color: T.green, fontWeight: 600, textAlign: "center", padding: "8px 0" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" style={{ verticalAlign: "middle", marginRight: 6 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                Subscribed!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(15,23,42,0.6)",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.white,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "'Vrikaan Sans'",
                  }}
                />
                <button
                  onClick={() => { if (newsletterEmail.includes("@")) setNewsletterSubmitted(true); }}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: `linear-gradient(135deg, ${T.accent}, ${T.cyan})`,
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Vrikaan Sans'",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.target.style.opacity = "1")}
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, backdropFilter: "blur(10px)" }}>
            <h4 style={{ fontFamily: "'Vrikaan Sans'", fontSize: 15, fontWeight: 700, color: T.white, margin: "0 0 14px 0" }}>Tags</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {tags.map((tag) => {
                const isHov = hoveredTag === tag;
                return (
                  <span
                    key={tag}
                    onClick={() => setSearchQuery(tag.toLowerCase())}
                    onMouseEnter={() => setHoveredTag(tag)}
                    onMouseLeave={() => setHoveredTag(null)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      background: isHov ? `${T.accent}20` : `${T.accent}10`,
                      color: isHov ? T.accent : T.muted,
                      cursor: "pointer",
                      border: `1px solid ${isHov ? T.accent + "30" : T.border}`,
                      transition: "all 0.2s",
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
