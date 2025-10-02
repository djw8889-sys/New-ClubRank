import { Router, Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/auth";

const router = Router();

// GET /api/clubs
router.get("/", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    // FIX: req.user가 존재하는지 확인하여 TypeScript 오류 해결
    if (!req.user) {
      return res.status(401).json({ error: "Authentication error: User not found." });
    }
    const userId = req.user.uid;
    console.log(`Fetching clubs for user: ${userId}`);
    
    // ... DB에서 클럽 목록 조회 로직 ...
    res.status(200).json({ clubs: [{ id: 1, name: "테스트 클럽" }] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
});

export default router;

