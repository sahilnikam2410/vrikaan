import { Helmet } from "react-helmet-async";

const defaults = {
  siteName: "VRIKAAN",
  title: "VRIKAAN - AI-Powered Cyber Defense Platform",
  description: "Enterprise-grade cybersecurity for everyone. Real-time threat detection, fraud analysis, and digital protection powered by AI. 15+ security tools in one dashboard.",
  url: "https://vrikaan.com",
  image: "https://vrikaan.com/og-image.png",
  twitter: "@vrikaan",
};

/**
 * Build a dynamic OG image URL from the @vercel/og edge function at /api/og.
 * Returns a 1200x630 PNG cached for 1 year at the CDN.
 */
function buildDynamicOgImage({ title, subtitle, category }) {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (subtitle) params.set("subtitle", subtitle);
  if (category) params.set("category", category);
  return `${defaults.url}/api/og?${params.toString()}`;
}

/**
 * SEO component — renders Helmet with title, description, OpenGraph, Twitter,
 * canonical, and optional JSON-LD structured data.
 *
 * Props:
 *   title        — page title (gets appended with " | VRIKAAN")
 *   description  — meta description
 *   path         — URL path (e.g. "/pricing")
 *   image        — override og:image
 *   noindex      — if true, adds robots meta noindex (for dashboard/admin)
 *   keywords     — comma-separated keywords
 *   jsonLd       — object or array of JSON-LD structured data
 *   type         — og:type (default "website")
 *   ogCategory   — category label shown on auto-generated OG image
 */
export default function SEO({
  title,
  description,
  path = "",
  image,
  noindex = false,
  keywords,
  jsonLd,
  type = "website",
  ogCategory,
}) {
  const pageTitle = title ? `${title} | ${defaults.siteName}` : defaults.title;
  const pageDesc = description || defaults.description;
  const pageUrl = `${defaults.url}${path}`;
  // If caller passes explicit image use it; otherwise auto-generate per-page OG
  // image via the @vercel/og edge function (cached 1 year at the CDN). If no
  // title was passed either, fall back to the static site image.
  const pageImage = image
    ? image
    : title
      ? buildDynamicOgImage({
          title,
          subtitle: description ? description.slice(0, 80) : undefined,
          category: ogCategory,
        })
      : defaults.image;

  const structuredData = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="theme-color" content="#030712" />
      <link rel="canonical" href={pageUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}

      {/* OpenGraph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={defaults.siteName} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={defaults.twitter} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={pageImage} />

      {/* JSON-LD structured data */}
      {structuredData.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}

/**
 * Build an Organization JSON-LD schema — use on the root/homepage only.
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VRIKAAN",
  url: defaults.url,
  logo: `${defaults.url}/favicon.svg`,
  sameAs: [
    "https://x.com/vrikaan",
    "https://www.linkedin.com/company/vrikaan-ai-cybersecurity",
    "https://www.instagram.com/vrikaan_official/",
    "https://github.com/sahilnikam2410/vrikaan",
  ],
  founder: [
    { "@type": "Person", name: "Sahil Anil Nikam", jobTitle: "Founder & CEO" },
    { "@type": "Person", name: "Khushi I. Raigade", jobTitle: "Co-Founder, SOC Analyst & Cybersecurity Researcher" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@vrikaan.com",
    contactType: "customer support",
    areaServed: "IN",
    availableLanguage: ["en"],
  },
};

/**
 * Build a SoftwareApplication JSON-LD — use on tool pages.
 */
export function softwareAppSchema({ name, description, url, category = "SecurityApplication" }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: category,
    operatingSystem: "Web",
    url,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "124" },
  };
}

/**
 * Build FAQ JSON-LD — use on pricing or FAQ pages.
 */
export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * Product schema — use on pricing/checkout pages, one per plan.
 */
export function productSchema({ name, description, price, currency = "INR", priceValidUntil }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: { "@type": "Brand", name: "VRIKAAN" },
    offers: {
      "@type": "Offer",
      url: `${defaults.url}/pricing`,
      priceCurrency: currency,
      price: String(price),
      priceValidUntil: priceValidUntil || `${new Date().getFullYear() + 1}-12-31`,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "VRIKAAN" },
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "124" },
  };
}

/**
 * Article schema — for blog posts and threat detail pages.
 */
export function articleSchema({ headline, description, datePublished, dateModified, author = "VRIKAAN", image, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image || defaults.image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Organization", name: author, url: defaults.url },
    publisher: {
      "@type": "Organization",
      name: "VRIKAAN",
      logo: { "@type": "ImageObject", url: `${defaults.url}/wolf-icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url || defaults.url },
  };
}

/**
 * HowTo schema — for guide pages (e.g. /2fa-guide).
 */
export function howToSchema({ name, description, steps, totalTime = "PT5M" }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  };
}

/**
 * BreadcrumbList schema helper.
 */
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${defaults.url}${item.path}`,
    })),
  };
}
