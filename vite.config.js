import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Geulbit/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', '*.woff'],
      manifest: {
        name: '글빛 (Geulbit)',
        short_name: 'Geulbit',
        description: '한글 모아쓰기 색채 분리 도구 — 교사 전용',
        theme_color: '#1e293b',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  // Allow serving font files from root
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2'],
})
