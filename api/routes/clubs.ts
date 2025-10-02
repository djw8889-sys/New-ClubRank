import { Router, Response } from "express";
import { ensureAuthenticated } from "../middleware/auth"; // FIX: 올바른 경로에서 import
import { AuthenticatedRequest } from "../types"; // FIX: 올바른 경로에서 import

const router = Router();

// GET /api/clubs
router.get("/", ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    console.log(`Fetching clubs for user: ${userId}`);
    // ... DB에서 클럽 목록 조회 로직 ...
    res.status(200).json({ clubs: [{ id: 1, name: "테스트 클럽" }] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
});

export default router; // FIX: default export 추가
