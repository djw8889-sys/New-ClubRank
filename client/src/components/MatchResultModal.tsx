import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMatchById } from "@/hooks/use-matches";
import { getAvatarSrc } from "@/utils/avatar";
import { Match, User } from "@shared/schema";

// MatchWithPlayers 인터페이스는 타입 추론에 혼란을 줄 수 있으므로 사용하지 않습니다.

export interface MatchResultModalProps {
  matchId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchResultModal({ matchId, isOpen, onClose }: MatchResultModalProps) {
  const { data: matchData, isLoading, error } = useMatchById(matchId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error instanceof Error ? error.message : "An error occurred"}</div>;
  
  // 데이터와 그 안의 모든 필수 속성이 완벽하게 존재하는지 최종 확인합니다.
  if (!matchData || !matchData.match || !matchData.player1 || !matchData.player2) {
    return null;
  }

  // 이제 matchData 객체에서 직접 속성을 꺼내 사용합니다.
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Match Result</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-around items-center">
          <div className="text-center">
            <img src={getAvatarSrc(matchData.player1.avatarUrl, matchData.player1)} alt={matchData.player1.username || ''} className="w-20 h-20 rounded-full mx-auto" />
            <p className="font-bold mt-2">{matchData.player1.username}</p>
            <p>{matchData.match.result === 'player1_wins' ? 'Winner' : ''}</p>
          </div>
          <div className="text-xl font-bold">VS</div>
          <div className="text-center">
            <img src={getAvatarSrc(matchData.player2.avatarUrl, matchData.player2)} alt={matchData.player2.username || ''} className="w-20 h-20 rounded-full mx-auto" />
            <p className="font-bold mt-2">{matchData.player2.username}</p>
            <p>{matchData.match.result === 'player2_wins' ? 'Winner' : ''}</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <p>ELO Change: {matchData.match.eloChange}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}