import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'client/index.html'
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      // Vercel이 @shared 경로를 인식할 수 있도록 별칭을 추가합니다.
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
})

