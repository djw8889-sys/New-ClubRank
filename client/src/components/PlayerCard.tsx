import { User } from "@shared/schema";
import { getAvatarSrc } from "@/utils/avatar";
import { getTierInfo } from "@/utils/tierCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// FIX: 누락된 Props 타입 정의 추가
export interface PlayerCardProps {
  player: User;
  onMatchRequest: (player: User) => void;
  onViewProfile: (player: User) => void;
}

// FIX: 누락된 tierColors 객체 정의 추가
const tierColors: { [key: string]: { color: string; bgColor: string } } = {
    Bronze: { color: "text-yellow-800", bgColor: "bg-yellow-200" },
    Silver: { color: "text-gray-600", bgColor: "bg-gray-300" },
    Gold: { color: "text-yellow-600", bgColor: "bg-yellow-400" },
    Platinum: { color: "text-teal-600", bgColor: "bg-teal-300" },
    Diamond: { color: "text-blue-500", bgColor: "bg-blue-200" },
    Master: { color: "text-purple-600", bgColor: "bg-purple-300" },
};

export default function PlayerCard({ player, onMatchRequest, onViewProfile }: PlayerCardProps) {
  const tierInfo = getTierInfo(player.elo ?? 1200);
  const colors = tierColors[tierInfo.name] || tierColors.Bronze;

  return (
    <Card className="w-full max-w-sm mx-auto cursor-pointer" onClick={() => onViewProfile(player)}>
      <CardContent className="p-4 flex items-center space-x-4">
        <img
          src={getAvatarSrc({ avatarUrl: player.avatarUrl, email: player.email })}
          alt={player.username || "player"}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-bold text-lg">{player.username}</h3>
          <div className="flex items-center space-x-2">
            <Badge className={`${colors.bgColor} ${colors.color}`}>{tierInfo.name}</Badge>
            <span className="font-semibold">{player.elo ?? 1200} pts</span>
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onMatchRequest(player);
          }}
          size="sm"
        >
          Match
        </Button>
      </CardContent>
    </Card>
  );
}

