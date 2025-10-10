import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "./client", // ✅ 프론트엔드 기준 폴더
  base: "/",        // ✅ 라우터가 항상 "/" 기준으로 작동하도록 설정
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "client/shared"),
    },
  },
  build: {
    outDir: "../dist",  // ✅ 빌드 결과가 루트의 dist/로 생성됨
    emptyOutDir: true,
  },
});
