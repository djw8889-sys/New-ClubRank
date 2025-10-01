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
  // req.body를 사용하기 위해 express.json() 미들웨어가 설정되어 있어야 합니다.
  const { someData } = req.body; 
  
  // 여기에 비즈니스 로직을 추가합니다.
  console.log(authenticatedReq.user.id, someData);

  res.json({ message: 'Success' });
});

router.put('/another-route', ensureAuthenticated, async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;
    // req.body를 사용하기 위해 express.json() 미들웨어가 설정되어 있어야 합니다.
    const { otherData } = req.body;

    // 여기에 비즈니스 로직을 추가합니다.
    console.log(authenticatedReq.user.id, otherData);
    
    res.json({ message: 'Updated' });
});

// 이 파일이 모듈임을 나타내기 위해 export 추가
export default router;