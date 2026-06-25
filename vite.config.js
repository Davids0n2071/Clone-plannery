// vite.config.js
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // El alias "@" apunta a la carpeta src/
      // Así puedes escribir: import X from "@/components/..."
      "@": path.resolve(__dirname, "./src"),
    },
  },
})