import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAvatarSrc } from "@/utils/avatar";
import { calculateTier } from "@/utils/tierCalculator";
import { User } from "@shared/schema";

interface MatchRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetUser: User;
  currentUserPoints: number;
  isLoading: boolean;
}

export default function MatchRequestModal({
  isOpen,
  onClose,
  onConfirm,
  targetUser,
  currentUserPoints,
  isLoading,
}: MatchRequestModalProps) {
  
  const targetUserTier = calculateTier(targetUser.points ?? 0);
  const currentUserTier = calculateTier(currentUserPoints);
  
  const eloDifference = Math.abs((targetUser.points ?? 0) - currentUserPoints);
  const expectedWinRate = 1 / (1 + Math.pow(10, eloDifference / 400));
  const pointsToWin = Math.round(32 * (1 - expectedWinRate));
  const pointsToLose = Math.round(32 * expectedWinRate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>대전 신청</DialogTitle>
          <DialogDescription>
            {targetUser.username}님에게 대전을 신청하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div className="flex items-center justify-around">
            {/* Current User */}
            <div className="flex flex-col items-center space-y-2">
              <img
                src={getAvatarSrc(null, {})}
                alt="My Avatar"
                className="w-20 h-20 rounded-full border-2 border-primary"
              />
              <p className="font-semibold">나</p>
              <p className="text-sm text-muted-foreground">
                {currentUserTier.currentTier.name} - {currentUserPoints}P
              </p>
            </div>

            <div className="text-2xl font-bold text-muted-foreground">VS</div>

            {/* Target User */}
            <div className="flex flex-col items-center space-y-2">
              <img
                src={getAvatarSrc(targetUser.avatarUrl, { id: targetUser.id, username: targetUser.username, email: targetUser.email })}
                alt={targetUser.username || "Opponent's Avatar"}
                className="w-20 h-20 rounded-full"
              />
              <p className="font-semibold">{targetUser.username}</p>
              <p className="text-sm text-muted-foreground">
                {targetUserTier.currentTier.name} - {targetUser.points ?? 0}P
              </p>
            </div>
          </div>

          <div className="text-center bg-muted p-3 rounded-lg">
            <p className="text-sm font-semibold">예상 ELO 변동</p>
            <div className="flex justify-center space-x-4 mt-2">
              <p className="text-sm text-green-600">승리 시: +{pointsToWin}P</p>
              <p className="text-sm text-red-600">패배 시: -{pointsToLose}P</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "신청 중..." : "신청하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}