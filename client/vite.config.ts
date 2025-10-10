import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ client/src 기준으로 인식됨
    },
  },
  build: {
    outDir: "dist",  // ✅ client 내부 dist 폴더 생성
    emptyOutDir: true,
  },
});
