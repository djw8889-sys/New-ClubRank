import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client', // 프로젝트의 루트를 'client' 폴더로 지정
  build: {
    // 빌드 결과물이 프로젝트 루트의 'dist' 폴더에 생성되도록 설정
    outDir: '../dist',
    // manifest: true, // 필요 시 manifest 생성
    // rollupOptions: { // 필요 시 추가 롤업 옵션
    //   input: path.resolve(__dirname, 'client/index.html'),
    // },
  },
  server: {
    // 개발 서버 프록시 설정 (Vercel 배포와는 무관)
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})