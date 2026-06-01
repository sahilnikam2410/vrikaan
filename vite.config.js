import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
// Set ANALYZE=1 before `npm run build` to generate dist/bundle-stats.html
export default defineConfig({
  plugins: [
    react(),
    process.env.ANALYZE === '1' && visualizer({
      filename: 'dist/bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ].filter(Boolean),
  build: {
    // Production optimizations
    target: 'es2020',
    cssMinify: true,
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false, // skip gzip-size scan to speed up build
    rollupOptions: {
      output: {
        // Push large libs into their own chunks so initial route doesn't ship them
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // three lives in its own chunk, loaded ONLY when Globe3D is
          // dynamically imported (after the Canvas2D placeholder paints) —
          // so it never blocks first paint.
          'vendor-three': ['three'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['react-icons'],
          'vendor-pdf': ['jspdf'],
          'vendor-qr': ['html5-qrcode'],
          'vendor-email': ['@emailjs/browser', 'emailjs-com'],
          'vendor-helmet': ['react-helmet-async'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
