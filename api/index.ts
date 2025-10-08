import express from "express";
import cors from "cors";

import mainRouter from "./routes";
import clubsRouter from "./routes/clubs";
import rankingsRouter from "./routes/rankings";

const app = express();

// ✅ CORS 설정 (Vercel 배포용)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ JSON 파서
app.use(express.json());

// ✅ 라우터 연결
app.use("/api", mainRouter);
app.use("/api/clubs", clubsRouter);
app.use("/api/rankings", rankingsRouter);

// ✅ 오류 핸들러
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("🔥 Server Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// ✅ 서버리스 함수용 export
export default app;
