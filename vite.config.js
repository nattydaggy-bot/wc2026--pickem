import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'EPL Pick\'em 2026/27',
        short_name: 'EPL Pick\'em',
        description: 'Predict Premier League matches with friends',
        theme_color: '#37003c',
        background_color: '#0f0014',
        display: 'standalone',
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/site\.api\.espn\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'espn-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})