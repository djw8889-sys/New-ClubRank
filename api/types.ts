import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * ensureAuthenticated 미들웨어를 통과한 후의 요청 타입입니다.
 * Express의 기본 Request 타입에 user 정보를 추가합니다.
 */
export interface AuthenticatedRequest extends Request {
  // `ensureAuthenticated`를 통과하면 user 객체가 항상 존재합니다.
  user: DecodedIdToken;
}

