import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    // garante uma única instância do three (react-globe.gl também o importa)
    dedupe: ['three'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['textures/earth-night.jpg', 'icons/icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,json,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: 'Meu Mundo Visitado',
        short_name: 'Meu Mundo',
        description:
          'Checklist interativo dos países que você já visitou, em um globo 3D.',
        lang: 'pt-BR',
        display: 'standalone',
        orientation: 'any',
        background_color: '#07070b',
        theme_color: '#07070b',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          globe: ['react-globe.gl', 'three'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
})
