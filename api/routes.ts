import type { Request, Response, NextFunction } from 'express';
import { User } from '../shared/schema'; // 경로 수정
import { registerClubRoutes } from './routes/clubs.js';
import registerRankingRoutes from './routes/rankings.js';
import { registerUserRoutes } from './routes/users.js';

// AuthenticatedRequest 타입을 명확히 정의하고 export 합니다.
// 로그인 확인 미들웨어를 통과한 요청은 user가 항상 존재한다고 가정합니다.
export interface AuthenticatedRequest extends Request {
  user: User;
}

// ensureAuthenticated 미들웨어를 export 합니다.
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

export function registerRoutes(app: any) {
  // 각 라우터 모듈을 해당 경로에 등록합니다.
  app.use('/api/clubs', registerClubRoutes);
  app.use('/api/rankings', registerRankingRoutes);
  app.use('/api/users', registerUserRoutes);

  // 나머지 라우트들...
  // 예시: app.get('/api/some-other-route', (req, res) => { ... });
  
  return app; 
}