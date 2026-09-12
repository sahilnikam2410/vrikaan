import { Helmet } from "react-helmet-async";
import { defaults } from "../lib/siteMeta";


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
      <meta name="theme-color" content="#060a14" />
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
