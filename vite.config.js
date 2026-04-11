import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production optimizations
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    // Increase chunk warning limit since we have vendor chunks
    chunkSizeWarningLimit: 800,
  },
})
