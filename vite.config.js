import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/Geulbit/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Allow serving font files from root
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2'],
})
