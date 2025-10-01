import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../shared/schema';

// AuthenticatedRequest 타입을 명확히 정의
export interface AuthenticatedRequest extends Request {
  user: User;
}

// ensureAuthenticated 미들웨어
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

const router = Router();

// 예시 라우트 (오류가 발생한 구조를 기반으로 수정)
router.post('/some-route', ensureAuthenticated, async (req: Request, res: Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.user.id;
  const { someData } = req.body; 

  // 여기에 비즈니스 로직을 추가합니다.
  console.log(userId, someData);

  res.json({ message: 'Success' });
});

router.put('/another-route', ensureAuthenticated, async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.user.id;
    const { otherData } = req.body;

    // 여기에 비즈니스 로직을 추가합니다.
    console.log(userId, otherData);
    
    res.json({ message: 'Updated' });
});

export default router;