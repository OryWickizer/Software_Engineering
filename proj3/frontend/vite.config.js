/* eslint-disable no-undef */
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // or '0.0.0.0' - exposes to Docker network
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Important for file changes to work in Docker
    },
  },
})
