import { Router, Request, Response } from "express";
import db from "../firebase-admin"; // ✅ firebase-admin의 default export
import authenticate from "../middleware/auth"; // ✅ 인증 미들웨어
import { DocumentData } from "firebase-admin/firestore";

const router = Router();

// ✅ 사용자가 속한 클럽 목록 조회
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    // 인증되지 않은 경우
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.uid;

    // Firestore에서 사용자가 포함된 클럽 조회
    const clubsSnapshot = await db
      .collection("clubs")
      .where("members", "array-contains", userId)
      .get();

    // 문서 데이터 변환
    const clubs = clubsSnapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(clubs);
  } catch (error) {
    console.error("🔥 Error fetching clubs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
