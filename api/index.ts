import express from 'express';
import mainRouter from './routes';
import clubsRouter from './routes/clubs'; // FIX: default export로 가져오도록 유지
import rankingsRouter from './routes/rankings';

const app = express();

app.use(express.json());

// 각 경로에 맞는 라우터를 등록합니다.
app.use('/api', mainRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/rankings', rankingsRouter);

// Vercel 배포를 위해 export default를 사용합니다.
export default app;

