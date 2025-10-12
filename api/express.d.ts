import { DecodedIdToken } from "firebase-admin/auth";

// 프로젝트 전역에서 Express의 Request 객체를 확장합니다.
declare global {
  namespace Express {
    export interface Request {
      // 이제 모든 Request 객체는 user 속성을 가질 수 있으며,
      // 그 타입은 Firebase의 DecodedIdToken 입니다.
      user: DecodedIdToken;
    }
  }
}
