import { useAuth } from "@/hooks/use-auth";
// import { useUpdateUserRole } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";

interface AdminPromotionProps {
  userId: string;
}

export default function AdminPromotion({ userId }: AdminPromotionProps) {
  const { profile } = useAuth();
  // const updateUserRoleMutation = useUpdateUserRole();

  if (!profile?.isAdmin) {
    return null;
  }

  const handlePromote = () => {
    // updateUserRoleMutation.mutate({ userId, isAdmin: true });
    // 아래 alert에서 userId를 사용하여 "사용되지 않음" 경고를 해결합니다.
    alert(`${userId} 사용자를 관리자로 승격하는 기능은 현재 개발 중입니다.`);
  };

  return (
    <Button onClick={handlePromote} disabled={true}>
      {/* disabled={updateUserRoleMutation.isPending} */}
      {'관리자로 승격'}
    </Button>
  );
}