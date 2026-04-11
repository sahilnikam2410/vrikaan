export default function handler(req, res) {
  // Redirect to the SVG OG image — works for crawlers that support SVG
  // For full PNG support, consider using @vercel/og in a pro plan
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  res.status(200).send(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta property="og:image" content="https://secuvion.vercel.app/og-image.svg">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #030712; display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; overflow: hidden; position: relative; }
  .bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(20,227,197,0.1) 0%, transparent 60%); }
  .grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(148,163,184,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.03) 1px, transparent 1px); background-size: 40px 40px; }
  .content { position: relative; text-align: center; z-index: 1; }
  .shield { width: 72px; height: 72px; margin: 0 auto 24px; }
  h1 { font-size: 64px; font-weight: 800; color: #f1f5f9; letter-spacing: -2px; margin-bottom: 16px; }
  h1 span { background: linear-gradient(135deg, #6366f1, #14e3c5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  p { font-size: 24px; color: #94a3b8; max-width: 600px; margin: 0 auto; }
  .badges { display: flex; gap: 12px; justify-content: center; margin-top: 32px; }
  .badge { padding: 8px 20px; border-radius: 100px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); color: #a5b4fc; font-size: 14px; font-weight: 600; }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="grid"></div>
  <div class="content">
    <svg class="shield" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" stroke="#14e3c5"/></svg>
    <h1><span>SECUVION</span></h1>
    <p>AI-Powered Cyber Defense Platform</p>
    <div class="badges">
      <div class="badge">Fraud Detection</div>
      <div class="badge">Dark Web Monitor</div>
      <div class="badge">Identity Protection</div>
    </div>
  </div>
</body>
</html>`);
}
