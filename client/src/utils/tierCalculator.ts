// Tennis tier calculation system based on points, win rate, and activity
// Tiers: Bronze -> Silver -> Gold -> Platinum -> Diamond -> Master -> Champion

export interface TierInfo {
  name: string;
  color: string;
  bgColor: string;
  minPoints: number;
  minWinRate?: number;
  minGames?: number;
}

export const TIERS: TierInfo[] = [
  {
    name: '브론즈',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    minPoints: 0,
    minGames: 0
  },
  {
    name: '실버',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    minPoints: 150,
    minGames: 3
  },
  {
    name: '골드',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    minPoints: 250,
    minGames: 5,
    minWinRate: 0.4
  },
  {
    name: '플래티넘',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    minPoints: 400,
    minGames: 8,
    minWinRate: 0.5
  },
  {
    name: '다이아몬드',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    minPoints: 600,
    minGames: 12,
    minWinRate: 0.6
  },
  {
    name: '마스터',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    minPoints: 900,
    minGames: 20,
    minWinRate: 0.65
  },
  {
    name: '챔피언',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    minPoints: 1500,
    minGames: 30,
    minWinRate: 0.7
  }
];

export function calculateTier(points: number, wins: number, losses: number): TierInfo {
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? wins / totalGames : 0;

  // Find the highest tier the user qualifies for
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const tier = TIERS[i];
    
    const meetsPoints = points >= tier.minPoints;
    const meetsGames = totalGames >= (tier.minGames || 0);
    const meetsWinRate = !tier.minWinRate || winRate >= tier.minWinRate;
    
    if (meetsPoints && meetsGames && meetsWinRate) {
      return tier;
    }
  }

  // Default to Bronze if no tier qualifies
  return TIERS[0];
}

export function getTierProgress(points: number, wins: number, losses: number): {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  progress: number;
  requirements: string[];
} {
  const currentTier = calculateTier(points, wins, losses);
  const currentIndex = TIERS.findIndex(tier => tier.name === currentTier.name);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;
  
  let progress = 100;
  const requirements: string[] = [];
  
  if (nextTier) {
    const totalGames = wins + losses;
    const currentWinRate = totalGames > 0 ? wins / totalGames : 0;
    
    // Calculate individual progress for each requirement
    const pointsProgress = Math.min(100, (points / nextTier.minPoints) * 100);
    const gamesProgress = nextTier.minGames ? Math.min(100, (totalGames / nextTier.minGames) * 100) : 100;
    const winRateProgress = nextTier.minWinRate ? Math.min(100, (currentWinRate / nextTier.minWinRate) * 100) : 100;
    
    // Overall progress is the minimum of all requirements (bottleneck)
    progress = Math.min(pointsProgress, gamesProgress, winRateProgress);
    
    // Check requirements for next tier
    if (points < nextTier.minPoints) {
      requirements.push(`${nextTier.minPoints - points}P 더 필요`);
    }
    
    if (nextTier.minGames && totalGames < nextTier.minGames) {
      requirements.push(`${nextTier.minGames - totalGames}경기 더 필요`);
    }
    
    if (nextTier.minWinRate && currentWinRate < nextTier.minWinRate) {
      // Calculate additional wins needed to reach target win rate
      // Formula: need at least ceil((r*totalGames - wins) / (1-r)) additional wins
      const targetWinRate = nextTier.minWinRate;
      const minAdditionalWins = Math.ceil(Math.max(0, (targetWinRate * totalGames - wins) / (1 - targetWinRate)));
      
      if (minAdditionalWins > 0) {
        requirements.push(`승률 ${Math.round(targetWinRate * 100)}% 달성을 위해 ${minAdditionalWins}승 더 필요`);
      } else {
        requirements.push(`승률 ${Math.round(targetWinRate * 100)}% (현재 ${Math.round(currentWinRate * 100)}%)`);
      }
    }
  }
  
  return {
    currentTier,
    nextTier,
    progress,
    requirements
  };
}