import { type Response } from "express";
import { db } from "../storage.js";
import { rankings, users } from "../../shared/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  type AuthenticatedRequest,
  ensureAuthenticated,
} from "../routes.js";
import { calculateElo } from "../elo-calculator.js";

export function registerRankingRoutes(app: any) {
  app.get(
    "/api/rankings/club/:clubId/members",
    ensureAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { clubId } = req.params;
        const clubMembers = await db
          .select({
            id: users.id,
            username: users.username,
            avatarUrl: users.avatarUrl,
            rating: rankings.rating,
            wins: rankings.wins,
            losses: rankings.losses,
            draws: rankings.draws,
          })
          .from(rankings)
          .innerJoin(users, eq(rankings.userId, users.id))
          .where(eq(rankings.clubId, clubId))
          .orderBy(desc(rankings.rating));

        res.json(clubMembers);
      } catch (error) {
        console.error("Error fetching club members ranking:", error);
        res.status(500).json({ message: "Failed to fetch club members ranking" });
      }
    }
  );

  app.get(
    "/api/rankings/club/:clubId/matches",
    ensureAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { clubId } = req.params;
        const matches = await db.query.matches.findMany({
          where: (matches, { eq }) => eq(matches.clubId, clubId),
          orderBy: (matches, { desc }) => [desc(matches.createdAt)],
          limit: 20,
          with: {
            player1: { columns: { username: true, avatarUrl: true } },
            player2: { columns: { username: true, avatarUrl: true } },
          },
        });
        res.json(matches);
      } catch (error) {
        console.error("Error fetching match history:", error);
        res.status(500).json({ message: "Failed to fetch match history" });
      }
    }
  );

  app.post(
    "/api/rankings/matches/report",
    ensureAuthenticated,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const { clubId, player1Id, player2Id, result } = req.body;
        const userId = req.user!.id;

        if (userId !== player1Id && userId !== player2Id) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const [ranking1, ranking2] = await Promise.all([
          db.query.rankings.findFirst({
            where: (rankings, { and, eq }) =>
              and(eq(rankings.userId, player1Id), eq(rankings.clubId, clubId)),
          }),
          db.query.rankings.findFirst({
            where: (rankings, { and, eq }) =>
              and(eq(rankings.userId, player2Id), eq(rankings.clubId, clubId)),
          }),
        ]);

        if (!ranking1 || !ranking2) {
          return res.status(404).json({ message: "Rankings not found" });
        }

        const { player1Elo, player2Elo } = calculateElo(
          ranking1.rating ?? 1200, // null일 경우 기본값 사용
          ranking2.rating ?? 1200, // null일 경우 기본값 사용
          result
        );

        await db.transaction(async (tx) => {
          await tx
            .update(rankings)
            .set({
              rating: player1Elo,
              wins: sql`${rankings.wins} + ${result === "win" ? 1 : 0}`,
              losses: sql`${rankings.losses} + ${result === "loss" ? 1 : 0}`,
              draws: sql`${rankings.draws} + ${result === "draw" ? 1 : 0}`,
            })
            .where(and(eq(rankings.userId, player1Id), eq(rankings.clubId, clubId)));

          await tx
            .update(rankings)
            .set({
              rating: player2Elo,
              wins: sql`${rankings.wins} + ${result === "loss" ? 1 : 0}`,
              losses: sql`${rankings.losses} + ${result === "win" ? 1 : 0}`,
              draws: sql`${rankings.draws} + ${result === "draw" ? 1 : 0}`,
            })
            .where(and(eq(rankings.userId, player2Id), eq(rankings.clubId, clubId)));

          await tx.insert(db.query.matches.fullSchema).values({
            clubId,
            player1Id,
            player2Id,
            result,
            eloChange: Math.abs(player1Elo - (ranking1.rating ?? 1200)),
            createdAt: new Date(),
          });
        });

        res.json({ message: "Match result reported successfully" });
      } catch (error) {
        console.error("Error reporting match result:", error);
        res.status(500).json({ message: "Failed to report match result" });
      }
    }
  );
}
