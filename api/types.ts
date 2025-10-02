import { Request } from "express";
import { DecodedIdToken } from "firebase-admin/auth";

/**
 * @description 인증 미들웨어를 통과한 요청에 대한 타입입니다.
 * Express의 Request 타입을 확장하고, user 속성을 DecodedIdToken으로 보장합니다.
 */
export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}
