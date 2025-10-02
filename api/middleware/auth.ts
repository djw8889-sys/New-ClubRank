import { Request, Response, NextFunction } from "express";
// import { admin } from '../firebaseAdmin';

export const ensureAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized: No token provided." });
  }

  const token = authorization.split("Bearer ")[1];

  try {
    // 실제 배포 시에는 아래 주석 처리된 Firebase Admin 로직을 사용해야 합니다.
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = decodedToken;

    if (token) {
      req.user = { uid: 'test-user-id' } as any; 
      next();
    } else {
      throw new Error("Token not found after split.");
    }
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return res.status(401).send({ message: "Unauthorized: Invalid token." });
  }
};

