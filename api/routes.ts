import { Router, Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
// ... 다른 import 구문들

// AuthenticatedRequest 인터페이스가 Express의 Request 타입을 확장(extends)하도록 수정합니다.
// 이렇게 하면 Request의 모든 기본 속성(body, params, query 등)을 상속받게 됩니다.
interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

const router = Router();

// 예시: 인증 미들웨어 (이 미들웨어는 req 객체에 user 정보를 추가하는 역할을 합니다)
// 실제 프로젝트의 인증 미들웨어 로직에 맞게 적용해야 합니다.
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 이 부분은 실제 인증 로직(예: 헤더에서 토큰 파싱 및 검증)으로 대체되어야 합니다.
  // 아래는 req 타입 에러를 해결하기 위한 예시 구조입니다.
  try {
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // (req as AuthenticatedRequest).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};


// 보호된 라우트 핸들러에서 AuthenticatedRequest 타입을 명시합니다.
router.post(
  "/matches",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // 이제 req.user 와 req.body 모두 타입 에러 없이 안전하게 접근할 수 있습니다.
      const userId = req.user.uid;
      const matchData = req.body;

      // ... 데이터베이스에 경기 정보 저장 로직 ...
      
      res.status(201).json({ message: "Match created successfully" });
    } catch (error) {
      console.error("Failed to create match:", error);
      res.status(500).json({ error: "Server error while creating match" });
    }
  }
);

// 다른 라우트에서도 동일한 패턴을 적용합니다.
router.get(
    "/my-matches",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user.uid;
            
            // ... 데이터베이스에서 해당 유저의 경기 목록 조회 로직 ...

            res.status(200).json({ matches: [] }); // 조회된 데이터를 반환
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            res.status(500).json({ error: 'Failed to fetch matches' });
        }
    }
);


export default router;

