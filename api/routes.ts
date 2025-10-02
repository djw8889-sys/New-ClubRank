import { Router, Response } from "express";
import { ensureAuthenticated } from "./middleware/auth";
import { AuthenticatedRequest } from "./types";

const router = Router();

// POST /api/matches
router.post(
  "/matches",
  ensureAuthenticated,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.uid; // FIX: 이제 타입 에러 없이 사용 가능
      const matchData = req.body;
      
      console.log(`Match creation request by user: ${userId}`);
      console.log("Match data:", matchData);

      // ... DB에 경기 정보 저장 로직 ...

      res.status(201).json({ message: "Match created successfully" });
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
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user.uid;
            console.log(`Fetching matches for user: ${userId}`);

            // ... DB에서 해당 유저의 경기 목록 조회 로직 ...

            res.status(200).json({ matches: [] });
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            res.status(500).json({ error: 'Failed to fetch matches' });
        }
    }
);

export default router;
