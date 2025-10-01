// types/express.d.ts
import { User } from '../shared/schema'; // User 타입을 스키마에서 가져옵니다.

// Express의 기존 Request 인터페이스를 확장합니다.
declare global {
  namespace Express {
    export interface Request {
      user?: User; // Request 객체에 user 속성이 있을 수도 있고(optional), 그 타입은 User 입니다.
      session: session.Session & Partial<session.SessionData> & {
        passport?: {
          user?: any;
        }
      };
    }
  }
}

// 이 파일이 모듈임을 나타내기 위해 빈 export를 추가합니다.
export {};

