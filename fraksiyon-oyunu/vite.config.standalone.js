import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Tarayıcı sunucusu olmadan doğrudan çift tıklayıp açılabilen, tek dosyalık
// bağımsız bir HTML derlemesi üretir (npm install/sunucu gerektirmez).
// PWA/service worker burada devre dışıdır çünkü file:// üzerinden çalışmaz.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist-standalone',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
  plugins: [react(), tailwindcss(), viteSingleFile()],
})
