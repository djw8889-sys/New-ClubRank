import { Router, Request, Response } from "express"; // FIX: Request import
import { ensureAuthenticated } from "../middleware/auth";

const router = Router();

// GET /api/rankings
router.get("/", ensureAuthenticated, async (req: Request, res: Response) => { // FIX: 기본 Request 타입 사용
  try {
    console.log(`User ${req.user.uid} is fetching rankings.`);
    res.status(200).json({ rankings: [{ userId: 'p1', rank: 1, score: 1500 }] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
});

export default router;

