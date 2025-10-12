import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Replit 백엔드 주소 (고정)
  const API_BASE = "https://match-point-connect-djw8889.replit.app";

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/users/${user.uid}`);
        if (!response.ok) throw new Error("사용자 정보를 불러오지 못했습니다.");

        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, user]);

  const handleFriendRequest = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/api/friends/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) throw new Error("친구 요청 실패");

      alert("친구 요청을 보냈습니다!");
    } catch (err) {
      alert("요청 중 오류가 발생했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-[400px] shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>

        {loading ? (
          <p className="text-center text-gray-500">불러오는 중...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : profile ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">프로필</h2>
            <div className="space-y-2">
              <p><strong>이름:</strong> {profile.name || "정보 없음"}</p>
              <p><strong>이메일:</strong> {profile.email || "정보 없음"}</p>
              <p><strong>포인트:</strong> {profile.points ?? 0}</p>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleFriendRequest}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                친구 요청 보내기
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">사용자 정보를 찾을 수 없습니다.</p>
        )}
      </motion.div>
    </div>
  );
}
