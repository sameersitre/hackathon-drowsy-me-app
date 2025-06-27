import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/hackathon-drowsy-me-app/',
  plugins: [react()],
})
