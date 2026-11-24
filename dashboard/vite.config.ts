import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages publica el sitio en /<nombre-del-repo>/
  base: '/dashboard-credito-agropecuario/',
})
