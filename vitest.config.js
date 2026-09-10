import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Separate vitest config so we can opt into jsdom + setup files
// without forcing the production Vite build to load them.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.js"],
    css: false,
    // api/ tests cover the serverless trust boundary — the cron gate, the
    // SSRF guard and the payment webhook. They declare `@vitest-environment
    // node` in a docblock so they don't run under jsdom.
    include: ["src/**/*.{test,spec}.{js,jsx}", "api/**/*.{test,spec}.js"],
  },
});
