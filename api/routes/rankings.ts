import { Router, Request, Response } from "express";
import { db } from "../storage.js";
import { users } from "../../shared/schema.js";
import { desc } from "drizzle-orm";
import { ensureAuthenticated } from "../routes.js";

const router = Router();

router.get("/global", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const topPlayers = await db
      .select({
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        elo: users.elo,
        wins: users.wins,
        losses: users.losses,
      })
      .from(users)
      .orderBy(desc(users.elo))
      .limit(100);
    res.json(topPlayers);
  } catch (error) {
    console.error("Error fetching global rankings:", error);
    res.status(500).json({ message: "Failed to fetch global rankings" });
  }
});

export default router;