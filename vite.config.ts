import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  // 1. 빌드의 시작점을 'client' 폴더로 지정합니다.
  root: 'client', 
  plugins: [react()],
  resolve: {
    alias: {
      // 2. 경로 별명은 그대로 유지합니다.
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3000",
    },
  },
  // 3. 빌드 결과물이 저장될 위치를 프로젝트 루트의 'dist' 폴더로 지정합니다.
  build: {
    outDir: '../dist',
    emptyOutDir: true, // outDir이 프로젝트 루트 밖에 있을 경우 경고를 없애고 해당 폴더를 비웁니다.
  }
})

