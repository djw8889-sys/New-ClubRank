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
  registerClubRoutes(app);
  app.use('/rankings', registerRankingRoutes);
  registerUserRoutes(app);

  // 나머지 라우트들...
  // (기존 파일의 나머지 라우트 코드는 여기에 그대로 유지됩니다)
  
  return app; 
}