import { Router, Request, Response } from "express"; // NextFunction import 제거
import { db } from "../storage.js";
import { users } from "../../shared/schema.js";
import { desc } from "drizzle-orm";

import { AuthenticatedRequest, ensureAuthenticated } from "../routes.js";

const router = Router();

// Get rankings for a specific club
router.get(
  "/club/:clubId",
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const clubId = parseInt(authReq.params.clubId, 10);
    if (isNaN(clubId)) {
      return res.status(400).json({ message: "Invalid club ID" });
    }

    try {
      const clubRankings = await db.query.users.findMany({
        orderBy: [desc(users.elo)],
      });

      res.json(clubRankings);
    } catch (error) {
      console.error("Error fetching club rankings:", error);
      res.status(500).json({ message: "Failed to fetch club rankings" });
    }
  }
);

// Get global rankings
router.get(
  "/global",
  ensureAuthenticated,
  async (_req: Request, res: Response) => { // 사용하지 않는 req를 _req로 변경
     try {
      const globalRankings = await db.query.users.findMany({
        orderBy: [desc(users.elo)],
        limit: 100, // Example: limit to top 100
      });
      res.json(globalRankings);
    } catch (error) {
      console.error("Error fetching global rankings:", error);
      res.status(500).json({ message: "Failed to fetch global rankings" });
    }
  }
);


// Update rankings after a match
router.post(
  "/update",
  ensureAuthenticated,
  async (_req: Request, res: Response) => { // 사용하지 않는 req를 _req로 변경
    res.status(501).json({ message: "Not implemented" });
  }
);

export default router;