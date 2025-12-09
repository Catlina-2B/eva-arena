import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force all dependencies to use the same copy of React and React-DOM
    dedupe: ['react', 'react-dom'],
  },
  // Optimize dependencies to ensure proper commonjs/esm interop
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
