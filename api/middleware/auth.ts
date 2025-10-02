import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // 전역으로 확장된 Request 타입에 user 할당
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).send('Invalid token');
  }
};

export default authenticate; // 'export { authenticate }' 대신 default export 사용