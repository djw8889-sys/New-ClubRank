import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "./client",               // ✅ index.html 위치 지정
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),  // ✅ client/src 기준
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
