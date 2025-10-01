// Define the tiers and their point requirements
const tiers = [
  { name: "Bronze", minPoints: 0 },
  { name: "Silver", minPoints: 1200 },
  { name: "Gold", minPoints: 1400 },
  { name: "Platinum", minPoints: 1600 },
  { name: "Diamond", minPoints: 1800 },
  { name: "Master", minPoints: 2000 },
  { name: "Grandmaster", minPoints: 2200 },
  { name: "Challenger", minPoints: 2400 },
];

// Function to get tier information based on ELO points
export const getTierInfo = (points: number) => {
  let tier = tiers[0];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].minPoints) {
      tier = tiers[i];
      break;
    }
  }

  const nextTier = tiers.find((t) => t.minPoints > points);

  return {
    name: tier.name,
    minPoints: tier.minPoints,
    nextTierName: nextTier ? nextTier.name : null,
    pointsForNextTier: nextTier ? nextTier.minPoints - points : null,
    progress: nextTier
      ? ((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) *
        100
      : 100,
  };
};
