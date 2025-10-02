import express from 'express';
import mainRouter from './routes'; // FIX: default export로 가져오기
import clubsRouter from './routes/clubs';
import rankingsRouter from './routes/rankings';

const app = express();

app.use(express.json());

// FIX: 가져온 라우터를 미들웨어로 등록
app.use('/api', mainRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/rankings', rankingsRouter);

export default app;
