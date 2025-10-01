import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'root' 옵션을 제거하고, 빌드 설정을 명시적으로 추가합니다.
  build: {
    // 빌드 결과물이 최상위 'dist' 폴더에 생성되도록 설정합니다.
    outDir: 'dist',
    rollupOptions: {
      // 빌드의 시작점이 'client/index.html' 파일임을 알려줍니다.
      input: 'client/index.html'
    }
  },
  resolve: {
    alias: {
      // 기존 앨리어스는 그대로 유지합니다.
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
})
