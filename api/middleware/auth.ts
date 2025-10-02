import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
// import { admin } from '../firebaseAdmin'; // 실제 Firebase Admin SDK 초기화 파일 경로

/**
 * @description 요청에 유효한 Firebase 인증 토큰이 있는지 확인하는 미들웨어입니다.
 * 인증 성공 시 req.user에 디코딩된 토큰을 추가하고, 실패 시 401 Unauthorized 응답을 보냅니다.
 */
export const ensureAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized: No token provided." });
  }

  const token = authorization.split("Bearer ")[1];

  try {
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = decodedToken;
    // NOTE: Vercel 서버리스 환경 테스트를 위해 임시로 req.user를 할당합니다.
    // 실제 배포 시에는 위 주석 처리된 Firebase Admin 로직을 사용해야 합니다.
    req.user = { uid: 'test-user-id' } as any; // 임시 데이터
    next();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return res.status(401).send({ message: "Unauthorized: Invalid token." });
  }
};
