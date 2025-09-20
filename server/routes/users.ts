import type { Express } from "express";
import { adminDb, verifyFirebaseToken } from "../firebase-admin.js";

export function registerUserRoutes(app: Express): void {
  // 특정 사용자의 공개 프로필 정보 조회 API
  app.get('/api/users/:userId', verifyFirebaseToken, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.uid;

      if (!userId) {
        return res.status(400).json({ error: 'userId가 필요합니다.' });
      }

      // Firestore에서 사용자 정보 조회
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      const userData = userDoc.data();
      if (!userData) {
        return res.status(404).json({ error: '사용자 데이터가 없습니다.' });
      }

      // 공개 가능한 정보만 반환 (민감한 정보 제외)
      const publicProfile = {
        id: userId,
        username: userData.username || '익명',
        photoURL: userData.photoURL || null,
        ntrp: userData.ntrp || '미설정',
        region: userData.region || '미설정',
        mannerScore: userData.mannerScore || 5,
        wins: userData.wins || 0,
        losses: userData.losses || 0,
        points: userData.points || 0,
        bio: userData.bio || null,
        tier: userData.tier || null,
        // 이메일 같은 민감한 정보는 제외
      };

      // 본인인지 확인해서 추가 정보 제공 여부 결정
      const isOwnProfile = currentUserId === userId;

      res.status(200).json({
        profile: publicProfile,
        isOwnProfile,
        message: '프로필 정보를 성공적으로 조회했습니다.'
      });

    } catch (error) {
      console.error('사용자 프로필 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
  });
}