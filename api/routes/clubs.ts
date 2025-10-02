import { Router, Request, Response } from "express"; // FIX: Request import
import { ensureAuthenticated } from "../middleware/auth";

const router = Router();

// GET /api/clubs
router.get("/", ensureAuthenticated, async (req: Request, res: Response) => { // FIX: 기본 Request 타입 사용
  try {
    const userId = req.user.uid;
    console.log(`Fetching clubs for user: ${userId}`);
    res.status(200).json({ clubs: [{ id: 1, name: "테스트 클럽" }] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
});

export default router;

