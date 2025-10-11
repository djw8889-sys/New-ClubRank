import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
build: {
  outDir: "dist",
  emptyOutDir: true,
  rollupOptions: {
    external: ["firebase/auth"], // ✅ 명시적으로 외부 모듈로 처리
  },
},
});
