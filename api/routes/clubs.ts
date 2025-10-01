import { type Response } from 'express';
import { db } from '../storage.js';
import { clubs, clubMembers, users, insertClubSchema, User } from '../../shared/schema.js'; // 경로 수정
import { eq, and, like, desc, count } from 'drizzle-orm';
import { ensureAuthenticated, type AuthenticatedRequest } from '../routes.js';

export function registerClubRoutes(app: any) {
    // /api/clubs/my-membership
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

    // ... (기존 파일의 나머지 라우트 코드는 여기에 그대로 유지됩니다)
}
