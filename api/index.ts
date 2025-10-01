import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import fs from "fs";
import path from "path";
import http from 'http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 로깅 미들웨어는 그대로 사용
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  // registerRoutes가 http.Server를 반환하므로, express app 인스턴스를 가져옵니다.
  const server = await registerRoutes(app);
  
  // Vercel 환경에서는 Vite나 정적 파일 서빙을 직접 처리하지 않으므로, 이 부분을 건너뜁니다.
  // vercel.json이 이 역할을 대신합니다.
  // 로컬 개발 환경에서만 Vite 미들웨어를 설정합니다.
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // 로컬 개발 환경을 위한 리스너
  // Vercel의 프로덕션 환경에서는 이 코드가 실행되지 않습니다.
  if (process.env.NODE_ENV === 'development') {
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, () => {
        console.log(`Development server listening on http://localhost:${port}`);
    });
  }
})();

// Vercel이 최종적으로 사용할 수 있도록 Express 앱을 export합니다.
export default app;

