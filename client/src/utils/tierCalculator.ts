// Define the tiers and their point requirements
const tiers = [
  { name: "Bronze", minPoints: 0, color: "text-amber-700", bgColor: "bg-amber-100" },
  { name: "Silver", minPoints: 1200, color: "text-gray-500", bgColor: "bg-gray-200" },
  { name: "Gold", minPoints: 1400, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  { name: "Platinum", minPoints: 1600, color: "text-cyan-500", bgColor: "bg-cyan-100" },
  { name: "Diamond", minPoints: 1800, color: "text-blue-500", bgColor: "bg-blue-100" },
  { name: "Master", minPoints: 2000, color: "text-purple-500", bgColor: "bg-purple-100" },
  { name: "Grandmaster", minPoints: 2200, color: "text-rose-500", bgColor: "bg-rose-100" },
  { name: "Challenger", minPoints: 2400, color: "text-red-500", bgColor: "bg-red-100" },
];

export interface TierInfo {
    name: string;
    minPoints: number;
    color: string;
    bgColor: string;
}

// Function to get tier information based on ELO points
export const getTierInfo = (points: number) => {
  let tier: TierInfo = tiers[0];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].minPoints) {
      tier = tiers[i];
      break;
    }
  }

  const nextTierIndex = tiers.findIndex((t) => t.minPoints > points);
  const nextTier = nextTierIndex > -1 ? tiers[nextTierIndex] : null;

  return {
    currentTier: tier,
    nextTier: nextTier,
    progress: nextTier
      ? ((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) *
        100
      : 100,
    requirements: nextTier ? [`${nextTier.minPoints}P 달성`] : [],
  };
};

export const calculateTier = (points: number) => {
  return getTierInfo(points);
};

// --- VERCEL FIX START ---
// TierProgressCard에서 필요한 함수 추가
export const getTierProgress = (points: number) => {
    return getTierInfo(points);
}
// --- VERCEL FIX END ---