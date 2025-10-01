import { Router } from "express";
import { db } from "../storage.js";
import { users } from "../../shared/schema.js";
import { desc } from "drizzle-orm";

import { AuthenticatedRequest, ensureAuthenticated } from "../routes.js";

const router = Router();

// Get rankings for a specific club
router.get(
  "/club/:clubId",
  ensureAuthenticated,
  async (req: AuthenticatedRequest, res) => {
    const clubId = parseInt(req.params.clubId, 10);
    if (isNaN(clubId)) {
      return res.status(400).json({ message: "Invalid club ID" });
    }

    try {
      // Note: This logic is likely incorrect as users are not directly tied to a single club ranking.
      // This should probably query a `rankings` table or join users with clubMembers.
      // Returning all users sorted by ELO as a placeholder.
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
  async (req, res) => {
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
  async (req, res) => {
    // This logic is complex and depends on a match result being submitted.
    // It should be triggered after a match is recorded.
    // For now, this is a placeholder.
    res.status(501).json({ message: "Not implemented" });
  }
);

export default router;

