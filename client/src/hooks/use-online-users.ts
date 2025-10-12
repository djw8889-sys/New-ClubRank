import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { useAuth } from './use-auth';
import { rtdb } from '@/lib/firebase';

export const useOnlineUsers = () => {
  const { profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) return;

    const usersRef = ref(rtdb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const online = Object.keys(usersData).filter(
          (uid) => usersData[uid].connections
        );
        setOnlineUsers(online);
      }
    });

    return () => unsubscribe();
  }, [profile]);

  return onlineUsers;
};