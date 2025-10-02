import { Router, Request, Response } from 'express';
import db from '../api/firebase-admin'; // 경로가 올바른지 확인해주세요.
import authenticate from '../api/middleware/auth'; // 경로가 올바른지 확인해주세요.

const router = Router();

// 예시: 내 클럽 정보 가져오기
router.get('/my-clubs', authenticate, async (req: Request, res: Response) => {
  try {
    // 전역 타입으로 req.user를 사용하므로, 존재 여부를 확인합니다.
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const userId = req.user.uid;
    const clubsSnapshot = await db.collection('clubs').where('members', 'array-contains', userId).get();

    if (clubsSnapshot.empty) {
      return res.status(404).json({ message: 'No clubs found for this user.' });
    }

    const clubs = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(clubs);
  } catch (error) {
    console.error('Error fetching user clubs:', error);
    res.status(500).json({ error: 'Failed to fetch user clubs.' });
  }
});

// 예시: 클럽 생성
router.post('/create-club', authenticate, async (req: Request, res: Response) => {
    try {
        if(!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        // req.body에서 직접 clubName과 location을 가져옵니다.
        const { clubName, location } = req.body;
        const userId = req.user.uid;

        if (!clubName || !location) {
            return res.status(400).json({ error: 'Club name and location are required.' });
        }

        const newClub = {
            name: clubName,
            location: location,
            owner: userId,
            members: [userId],
            createdAt: new Date(),
        };

        const docRef = await db.collection('clubs').add(newClub);

        res.status(201).json({ message: 'Club created successfully', clubId: docRef.id });

    } catch (error) {
        console.error('Error creating club:', error);
        res.status(500).json({ error: 'Failed to create club.' });
    }
});

export default router;