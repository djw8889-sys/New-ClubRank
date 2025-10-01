import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { getAvatarSrc } from '@/utils/avatar';
import { calculateTier } from '@/utils/tierCalculator';

interface PlayerCardProps {
  user: User;
  onMatchRequest: (user: User) => void;
}

export default function PlayerCard({ user, onMatchRequest }: PlayerCardProps) {
  const tierInfo = calculateTier(user.points ?? 0);

  return (
    <div className="bg-background rounded-xl border border-border p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img
          src={getAvatarSrc(user.avatarUrl, user)}
          alt={user.username || 'User avatar'}
          className="w-14 h-14 rounded-full"
        />
        <div>
          <h3 className="font-semibold text-foreground text-lg">{user.username}</h3>
          <p className="text-sm text-muted-foreground">{user.wins}승 {user.losses}패</p>
          <div className="flex items-center space-x-2 mt-1">
            <i className={`fas fa-medal text-sm ${tierInfo.currentTier.color}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {tierInfo.currentTier.name} - {user.points}P
            </span>
          </div>
        </div>
      </div>
      <div className="text-right">
        {tierInfo.nextTier && (
          <p className="text-xs text-muted-foreground">
            다음 등급까지 {tierInfo.nextTier.minPoints - (user.points ?? 0)}P
          </p>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => onMatchRequest(user)}
        >
          대전 신청
        </Button>
      </div>
    </div>
  );
}