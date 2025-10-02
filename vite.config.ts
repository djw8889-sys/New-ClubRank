import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite가 'client' 폴더를 기준으로 작동하도록 설정합니다.
  root: 'client',
  build: {
    // 빌드 결과물이 프로젝트 루트의 'dist' 폴더에 생성되도록 경로를 수정합니다.
    outDir: '../dist',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})