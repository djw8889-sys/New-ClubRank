import { Router, Request, Response, NextFunction } from "express";
import { db } from "../storage.js";
import { users } from "../../shared/schema.js";
import { desc } from "drizzle-orm";

import { AuthenticatedRequest, ensureAuthenticated } from "../routes.js";

const router = Router();

// Get rankings for a specific club
router.get(
  "/club/:clubId",
  ensureAuthenticated,
  async (req: Request, res: Response) => { // req 타입을 일반 Request로 받습니다.
    const authReq = req as AuthenticatedRequest; // 타입 단언을 사용합니다.
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
  async (req: Request, res: Response) => {
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
  async (req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented" });
  }
);

export default router;