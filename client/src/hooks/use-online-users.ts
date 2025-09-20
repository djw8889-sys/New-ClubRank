import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { User } from '@shared/schema';

interface OnlineUsersResponse {
  users: User[];
  count: number;
  message: string;
}

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOnlineUsers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Firebase Auth 토큰 가져오기
      const token = await user.getIdToken();
      
      const response = await fetch('/api/users/online', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('온라인 사용자 목록을 가져올 수 없습니다.');
      }

      const data: OnlineUsersResponse = await response.json();
      setOnlineUsers(data.users || []);
    } catch (err) {
      console.error('Online users fetch error:', err);
      setError(err instanceof Error ? err.message : '서버 오류가 발생했습니다.');
      setOnlineUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOnlineUsers();
      
      // 30초마다 온라인 사용자 목록 새로고침
      const interval = setInterval(fetchOnlineUsers, 30000);
      
      return () => clearInterval(interval);
    } else {
      setOnlineUsers([]);
      setLoading(false);
    }
  }, [user]);

  return {
    onlineUsers,
    loading,
    error,
    refresh: fetchOnlineUsers,
  };
}