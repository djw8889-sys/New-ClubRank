import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMatchById } from "@/hooks/use-matches";
import { getAvatarSrc } from "@/utils/avatar";
import { Match, User } from "@shared/schema";

interface MatchWithPlayers {
    match: Match;
    player1: User;
    player2: User;
}

export interface MatchResultModalProps {
  matchId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchResultModal({ matchId, isOpen, onClose }: MatchResultModalProps) {
  const { data: matchData, isLoading, error } = useMatchById(matchId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error instanceof Error ? error.message : "An error occurred"}</div>;
  if (!matchData) return null;

  const { match, player1, player2 }: MatchWithPlayers = matchData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Match Result</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-around items-center">
          <div className="text-center">
            <img src={getAvatarSrc(player1.avatarUrl, { email: player1.email })} alt={player1.username || ''} className="w-20 h-20 rounded-full mx-auto" />
            <p className="font-bold mt-2">{player1.username}</p>
            <p>{match.result === 'player1_wins' ? 'Winner' : ''}</p>
          </div>
          <div className="text-xl font-bold">VS</div>
          <div className="text-center">
            <img src={getAvatarSrc(player2.avatarUrl, { email: player2.email })} alt={player2.username || ''} className="w-20 h-20 rounded-full mx-auto" />
            <p className="font-bold mt-2">{player2.username}</p>
            <p>{match.result === 'player2_wins' ? 'Winner' : ''}</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <p>ELO Change: {match.eloChange}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}