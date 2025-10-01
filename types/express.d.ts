// types/express.d.ts
import { User } from '../shared/schema'; // User 타입을 스키마에서 가져옵니다.
import * as session from 'express-session';

// Express의 기존 Request 인터페이스를 확장합니다.
declare global {
  namespace Express {
    export interface Request {
      // 모든 요청에 user가 있는 것은 아니므로 optional (?)로 정의합니다.
      user?: User;
      // 세션 타입도 명확하게 정의해줍니다.
      session: session.Session & Partial<session.SessionData> & {
        passport?: {
          user?: any;
        }
      };
      // isAuthenticated 함수가 존재함을 타입스크립트에게 알려줍니다.
      isAuthenticated(): boolean;
    }
  }
}

// 이 파일이 모듈임을 나타내기 위해 빈 export를 추가합니다.
export {};

