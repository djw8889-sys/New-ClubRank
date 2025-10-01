import { useAuth } from "@/hooks/use-auth";
import { useUpdateUserRole } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";

interface AdminPromotionProps {
  userId: string;
}

export default function AdminPromotion({ userId }: AdminPromotionProps) {
  const { profile } = useAuth();
  const updateUserRoleMutation = useUpdateUserRole();

  if (!profile?.isAdmin) {
    return null;
  }

  const handlePromote = () => {
    updateUserRoleMutation.mutate({ userId, isAdmin: true });
  };

  return (
    <Button onClick={handlePromote} disabled={updateUserRoleMutation.isPending}>
      {updateUserRoleMutation.isPending ? '승격 중...' : '관리자로 승격'}
    </Button>
  );
}