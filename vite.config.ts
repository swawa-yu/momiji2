import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES
    ? "momiji2"
    : "./",
  plugins: [react()],
})
