import { Router, Request, Response } from 'express';
import db from '../firebase-admin'; // default import로 수정
import authenticate from '../middleware/auth'; // default import로 수정
import { DocumentData } from 'firebase-admin/firestore';

const router = Router();

router.get('/:clubId', authenticate, async (req: Request, res: Response) => {
    try {
        const { clubId } = req.params;
        const rankingsSnapshot = await db.collection('users').where('clubId', '==', clubId).orderBy('elo', 'desc').get();
        const rankings = rankingsSnapshot.docs.map((doc: DocumentData) => doc.data()); // doc 타입 명시
        res.json(rankings);
    } catch (error) {
        console.error("Error fetching rankings:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;