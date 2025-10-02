import { Router, Response } from "express";
import { ensureAuthenticated } from "./middleware/auth";
import { AuthenticatedRequest } from "./types"; // FIX: 정의된 타입 import

const router = Router();

// Firebase Admin 초기화 (주석 처리됨)
// import { admin } from "./firebase-admin";

// 인증 테스트용 미들웨어 (실제 사용 시엔 불필요)
router.use((req, res, next) => {
  // console.log("Request to:", req.originalUrl);
  next();
});

// POST /api/matches
router.post(
  "/matches",
  ensureAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => { // FIX: AuthenticatedRequest 타입 사용
    try {
      const userId = req.user.uid;
      const matchData = req.body;
      
      // 실제 데이터베이스 로직 추가
      console.log(`Match creation request by user: ${userId}`, matchData);

      res.status(201).json({ message: "Match created successfully", match: matchData });
    } catch (error) {
      console.error("Failed to create match:", error);
      res.status(500).json({ error: "Server error while creating match" });
    }
  }
);

// GET /api/my-matches
router.get(
    "/my-matches",
    ensureAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => { // FIX: AuthenticatedRequest 타입 사용
        try {
            const userId = req.user.uid;
            
            // 실제 데이터베이스 로직 추가
            console.log(`Fetching matches for user: ${userId}`);

            // 임시 데이터 응답
            const mockMatches = [
                { id: 1, opponent: "Player A", result: "Win" },
                { id: 2, opponent: "Player B", result: "Loss" }
            ];

            res.status(200).json({ matches: mockMatches });
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            res.status(500).json({ error: 'Failed to fetch matches' });
        }
    }
);

export default router;

