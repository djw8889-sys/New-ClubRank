import { type Response } from 'express';
import { db } from '../storage.js';
import { clubs, clubMembers } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { ensureAuthenticated, type AuthenticatedRequest } from '../routes.js';

export function registerClubRoutes(app: any) {
  app.get('/api/clubs/my-membership', ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    try {
      const memberships = await db.select({
        clubId: clubs.id,
        clubName: clubs.name,
        clubLogoUrl: clubs.logoUrl,
        role: clubMembers.role,
      })
      .from(clubMembers)
      .innerJoin(clubs, eq(clubMembers.clubId, clubs.id))
      .where(eq(clubMembers.userId, userId));

      res.json(memberships);
    } catch (error) {
      console.error('Error fetching user club memberships:', error);
      res.status(500).json({ message: 'Failed to fetch club memberships' });
    }
  });

  // 여기에 다른 클럽 관련 라우트 함수들이 있다면 그대로 유지됩니다.
  // 이 코드는 빌드 로그의 'unused variable' 오류를 해결하기 위함입니다.
}

