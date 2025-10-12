import { Router, Request, Response } from "express";
import db from "../firebase-admin"; // ✅ firebase-admin default import
import authenticate from "../middleware/auth"; // ✅ 인증 미들웨어
import { DocumentData } from "firebase-admin/firestore";

const router = Router();

// ✅ 특정 클럽의 랭킹 목록 조회
router.get("/:clubId", authenticate, async (req: Request, res: Response) => {
  try {
    const { clubId } = req.params;

    // Firestore에서 해당 클럽의 사용자 랭킹 조회
    const rankingsSnapshot = await db
      .collection("users")
      .where("clubId", "==", clubId)
      .orderBy("elo", "desc")
      .get();

    // 문서 데이터 변환
    const rankings = rankingsSnapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(rankings);
  } catch (error) {
    console.error("🔥 Error fetching rankings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
