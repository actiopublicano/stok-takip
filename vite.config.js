import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/stok-takip/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Çiçek Serası',
        short_name: 'Çiçek Serası',
        description: 'Kendi çiçek seranı kur, yetiştir ve sat!',
        theme_color: '#1b5e20',
        background_color: '#1a2e1a',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'tr',
        icons: [
          { src: '/stok-takip/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/stok-takip/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
})
