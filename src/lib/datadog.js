// Datadog Real-User Monitoring. Completely inert unless BOTH keys are present
// (set in Vercel env: VITE_DD_APP_ID + VITE_DD_CLIENT_TOKEN) and the app is
// running in production — so local/preview builds never ship telemetry.
// Captures errors, Core Web Vitals, resource timing, and user journeys on the
// live site; session replay is sampled. The SDK is dynamically imported only
// when active, so it adds ZERO bundle weight when monitoring is off.
// Monitoring must never break the app, so the whole thing is wrapped in catch.
export async function initDatadog() {
  const applicationId = import.meta.env.VITE_DD_APP_ID;
  const clientToken = import.meta.env.VITE_DD_CLIENT_TOKEN;
  if (!applicationId || !clientToken) return;        // keys absent → no-op
  if (import.meta.env.MODE !== "production") return;  // dev / preview → skip
  try {
    const { datadogRum } = await import("@datadog/browser-rum");
    datadogRum.init({
      applicationId,
      clientToken,
      site: import.meta.env.VITE_DD_SITE || "datadoghq.com", // e.g. datadoghq.eu, us5.datadoghq.com
      service: "vrikaan-web",
      env: "production",
      version: import.meta.env.VITE_DD_VERSION || undefined,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input", // never record what users type
    });
  } catch {
    /* monitoring is best-effort — never block app boot */
  }
}
