import { Router, Response } from "express";
import { ensureAuthenticated } from "../middleware/auth"; // FIX: 올바른 경로에서 import
import { AuthenticatedRequest } from "../types"; // FIX: 올바른 경로에서 import

const router = Router();

// GET /api/rankings
router.get("/", ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(`User ${req.user.uid} is fetching rankings.`);
    // ... DB에서 랭킹 정보 조회 로직 ...
    res.status(200).json({ rankings: [{ userId: 'p1', rank: 1, score: 1500 }] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
});

export default router; // FIX: default export 추가
