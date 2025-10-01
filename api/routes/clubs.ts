import { type Response } from 'express';
import { db } from '../storage.js';
import { clubs, clubMembers } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { ensureAuthenticated, type AuthenticatedRequest } from '../routes.js';

export function registerClubRoutes(app: any) {
    app.get('/api/clubs/my-membership', ensureAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
        // 이 부분은 기존 코드와 동일하게 유지됩니다.
        // ... (이하 모든 라우트 코드는 그대로 유지)
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

    // 참고: 사용자님의 기존 clubs.ts 파일에 다른 라우트 함수들이 더 있다면,
    // 이 파일에 그대로 유지되어야 합니다.
    // 여기서는 로그에 나온 오류를 해결하기 위해 import 부분만 수정한 것입니다.
}

