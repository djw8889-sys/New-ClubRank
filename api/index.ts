import express from 'express';
import { registerRoutes } from './routes.js'; // default import -> named import로 수정

const app = express();

// registerRoutes 함수를 호출하여 라우트를 등록합니다.
registerRoutes(app);

// Vercel에서 서버리스 함수로 처리할 수 있도록 app을 export 합니다.
export default app;