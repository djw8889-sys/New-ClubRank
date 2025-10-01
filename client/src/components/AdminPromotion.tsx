import { useAuth } from "@/hooks/use-auth";
// import { useUpdateUserRole } from "@/hooks/use-admin"; // 이 hook이 없으므로 주석 처리
import { Button } from "@/components/ui/button";

interface AdminPromotionProps {
  userId: string;
}

export default function AdminPromotion({ userId }: AdminPromotionProps) {
  const { profile } = useAuth();
  // const updateUserRoleMutation = useUpdateUserRole(); // 이 hook이 없으므로 주석 처리

  if (!profile?.isAdmin) {
    return null;
  }

  const handlePromote = () => {
    // updateUserRoleMutation.mutate({ userId, isAdmin: true });
    alert("관리자 승격 기능은 현재 개발 중입니다."); // 임시 기능
  };

  return (
    <Button onClick={handlePromote} disabled={true}> 
      {/* disabled={updateUserRoleMutation.isPending} */}
      {'관리자로 승격'}
    </Button>
  );
}