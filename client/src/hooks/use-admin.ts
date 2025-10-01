import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isAdmin });
    },
    onSuccess: () => {
      toast({ title: '사용자 역할이 업데이트되었습니다.' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast({
        title: '오류가 발생했습니다.',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};