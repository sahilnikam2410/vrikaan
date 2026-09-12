/**
 * JSON-LD schema builders for structured data.
 *
 * Split out of SEO.jsx so that file exports only its component. A module
 * mixing a component with plain functions breaks Fast Refresh: editing the
 * component forces a full reload instead of a hot swap.
 */

import { defaults } from "./siteMeta";

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
    { "@type": "Person", name: "Sahil Anil Nikam", jobTitle: "Founder & CEO · SOC Analyst & Cybersecurity Researcher" },
    { "@type": "Person", name: "Khushi Ishwar Raigade", jobTitle: "Co-Founder & COO/CISO" },
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
