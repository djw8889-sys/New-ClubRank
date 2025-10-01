import { useEffect } from 'react';
import { ref, onValue, onDisconnect, serverTimestamp, set } from 'firebase/database';
import { useAuth } from './use-auth';
import { rtdb } from '@/lib/firebase';

export const usePresence = () => {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;

    const myConnectionsRef = ref(rtdb, `users/${profile.id}/connections`);
    const lastOnlineRef = ref(rtdb, `users/${profile.id}/lastOnline`);
    const connectedRef = ref(rtdb, '.info/connected');

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        set(myConnectionsRef, true);
        onDisconnect(myConnectionsRef).remove();
        onDisconnect(lastOnlineRef).set(serverTimestamp());
      }
    });
  }, [profile]);
};