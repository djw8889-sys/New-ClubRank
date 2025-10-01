import { User } from "@shared/schema";
import { getAvatarSrc } from "@/utils/avatar";
import { getTierInfo } from "@/utils/tierCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerCardProps {
  player: User;
  onMatchRequest: (player: User) => void;
  onViewProfile: (player: User) => void;
}

const tierColors: { [key: string]: { color: string; bgColor: string } } = {
    Bronze: { color: "text-yellow-800", bgColor: "bg-yellow-200" },
    Silver: { color: "text-gray-600", bgColor: "bg-gray-300" },
    Gold: { color: "text-yellow-600", bgColor: "bg-yellow-400" },
    Platinum: { color: "text-teal-600", bgColor: "bg-teal-300" },
    Diamond: { color: "text-blue-500", bgColor: "bg-blue-200" },
    Master: { color: "text-purple-600", bgColor: "bg-purple-300" },
    Grandmaster: { color: "text-red-700", bgColor: "bg-red-400" },
    Challenger: { color: "text-indigo-800", bgColor: "bg-indigo-400" },
};

export default function PlayerCard({
  player,
  onMatchRequest,
  onViewProfile,
}: PlayerCardProps) {
  const tierInfo = getTierInfo(player.elo ?? 1200);
  const colors = tierColors[tierInfo.name] || tierColors.Bronze;

  return (
    <Card
      className="w-full max-w-sm mx-auto cursor-pointer"
      onClick={() => onViewProfile(player)}
    >
      <CardContent className="p-4 flex items-center space-x-4">
        <img
          src={getAvatarSrc(player.avatarUrl, player)}
          alt={player.username || 'player'}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-bold text-lg">{player.username}</h3>
          <div className="flex items-center space-x-2">
            <Badge className={`${colors.bgColor} ${colors.color}`}>
              {tierInfo.name}
            </Badge>
            <span className="font-semibold">{player.elo ?? 1200} pts</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMatchRequest(player);
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
        >
          Match
        </button>
      </CardContent>
    </Card>
  );
}