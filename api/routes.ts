// ... (파일 상단 import 구문들)
import { Router, Request, Response, NextFunction } from "express";
import { User } from "../shared/schema.js"; // User 타입 import 확인
// ...

// AuthenticatedRequest 인터페이스를 아래와 같이 수정하거나 추가합니다.
// Request를 올바르게 확장하여 body, params 등의 속성을 모두 포함하도록 합니다.
export interface AuthenticatedRequest extends Request {
  user?: User; // 세션이 없는 경우를 대비해 optional '?' 유지
}

// ... (다른 코드들)

// ensureAuthenticated 함수는 req 타입을 AuthenticatedRequest로 명시합니다.
export function ensureAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // req.isAuthenticated()는 passport에서 제공하는 함수입니다.
    // 타입 정의에 없을 경우, req as any로 임시 처리하거나 passport 타입 정의를 확장해야 합니다.
    if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
        return next();
    }
    // 직접 user 객체를 확인하는 로직을 추가하여 안정성을 높입니다.
    if (req.user) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}

