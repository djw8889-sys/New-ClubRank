import { Router, Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/auth";

const router = Router();

// GET /api/rankings
router.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    // FIX: req.user가 존재하는지 확인하여 TypeScript 오류 해결
    if (!req.user) {
      return res.status(401).json({ error: "Authentication error: User not found." });
    }
    console.log(`User ${req.user.uid} is fetching rankings.`);

    // ... DB에서 랭킹 정보 조회 로직 ...
    res.status(200).json({ rankings: [{ userId: 'p1', rank: 1, score: 1500 }] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
});

export default router;

