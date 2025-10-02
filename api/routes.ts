import { Router, Request, Response } from 'express';
import { db } from './firebase-admin';
import { authenticate } from './middleware/auth';
import { calculateElo } from './elo-calculator';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();

// Endpoint to get user data
router.get('/user', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to record a match
router.post('/matches', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { opponentId, result } = req.body;
    const userId = req.user.uid;

    const userDocRef = db.collection('users').doc(userId);
    const opponentDocRef = db.collection('users').doc(opponentId);

    const [userDoc, opponentDoc] = await Promise.all([userDocRef.get(), opponentDocRef.get()]);


    if (!userDoc.exists || !opponentDoc.exists) {
      return res.status(404).json({ error: 'User or opponent not found' });
    }

    const userData = userDoc.data();
    const opponentData = opponentDoc.data();

    if (!userData || !opponentData) {
        return res.status(404).json({ error: 'User data or opponent data is missing.' });
    }

    const userElo = userData.elo || 1200;
    const opponentElo = opponentData.elo || 1200;

    const { newWinnerElo, newLoserElo } = calculateElo(userElo, opponentElo, result);

    const matchData = {
      userId,
      opponentId,
      result,
      userEloBefore: userElo,
      opponentEloBefore: opponentElo,
      userEloAfter: result === 'win' ? newWinnerElo : newLoserElo,
      opponentEloAfter: result === 'win' ? newLoserElo : newWinnerElo,
      timestamp: FieldValue.serverTimestamp(),
    };

    await db.collection('matches').add(matchData);
    await userDocRef.update({ elo: matchData.userEloAfter });
    await opponentDocRef.update({ elo: matchData.opponentEloAfter });

    res.status(201).json({ message: 'Match recorded successfully', matchData });
  } catch (error) {
    console.error('Error recording match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;