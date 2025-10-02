import { Router, Response } from "express";
import { ensureAuthenticated } from "../middleware/auth";
import { AuthenticatedRequest } from "../types"; // FIX: 정의된 타입 import

const router = Router();

// GET /api/rankings
router.get("/", ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => { // FIX: AuthenticatedRequest 타입 사용
  try {
    // 이제 req.user는 타입 오류 없이 안전하게 접근 가능합니다.
    console.log(`User ${req.user.uid} is fetching rankings.`);

    // ... 실제 DB에서 랭킹 정보 조회 로직 ...

    res.status(200).json({ rankings: [{ userId: 'p1', rank: 1, score: 1500 }] });
  } catch (error) {
    console.error("Failed to fetch rankings:", error);
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
});

export default router;

