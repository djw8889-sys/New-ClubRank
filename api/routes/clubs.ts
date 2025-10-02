import { Router, Request, Response } from 'express';
import db from '../firebase-admin'; // default import로 수정
import authenticate from '../middleware/auth'; // default import로 수정
import { DocumentData } from 'firebase-admin/firestore';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.uid;
        const clubsSnapshot = await db.collection('clubs').where('members', 'array-contains', userId).get();
        const clubs = clubsSnapshot.docs.map((doc: DocumentData) => ({ id: doc.id, ...doc.data() })); // doc 타입 명시
        res.json(clubs);
    } catch (error) {
        console.error("Error fetching clubs:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;