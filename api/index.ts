import express from 'express';
import registerRoutes from './routes.js'; // 중괄호 {} 제거

const app = express();

// registerRoutes 함수를 호출하여 라우트를 등록합니다.
registerRoutes(app);

export default app;