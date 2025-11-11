import { Reward, RewardType, RevealState, RewardCard } from "./types";

// Reward definitions with metadata
export const REWARD_POOL: Reward[] = [
  // Common tokens (60% probability)
  {
    type: RewardType.CREDITS,
    name: "150 Credits",
    image: "/booster-pack/CREDITS_150000000000000000000.png",
    rarity: "common",
  },
  {
    type: RewardType.SURVIVOR,
    name: "10 Survivor",
    image: "/booster-pack/SURVIVOR_10000000000000000000.png",
    rarity: "common",
  },
  {
    type: RewardType.PAPER,
    name: "3,000 Paper",
    image: "/booster-pack/PAPER_3000000000000000000000.png",
    rarity: "common",
  },

  // Rare tokens (25% probability)
  {
    type: RewardType.NUMS,
    name: "2,000 NUMS",
    image: "/booster-pack/NUMS_2000000000000000000000.png",
    rarity: "rare",
  },
  {
    type: RewardType.LORDS,
    name: "75 LORDS",
    image: "/booster-pack/LORDS_75000000000000000000.png",
    rarity: "rare",
  },

  // Epic NFTs (10% probability)
  {
    type: RewardType.BLOBERT,
    name: "Blobert NFT",
    image: "/booster-pack/BLOBERT_1.png",
    rarity: "epic",
  },
  {
    type: RewardType.COSMETIC,
    name: "Cosmetic Item",
    image: "/booster-pack/COSMETIC_1.png",
    rarity: "epic",
  },
  {
    type: RewardType.REALM,
    name: "Realm NFT",
    image: "/booster-pack/REALM_1.png",
    rarity: "epic",
  },

  // Epic Games (10% probability)
  {
    type: RewardType.LS2_BEAST,
    name: "LS2 Beast",
    image: "/booster-pack/LS2_BEAST.png",
    rarity: "epic",
  },
  {
    type: RewardType.LS2_GAME,
    name: "LS2 Game Pass",
    image: "/booster-pack/LS2_GAME.png",
    rarity: "epic",
  },
  {
    type: RewardType.NUMS_GAME,
    name: "NUMS Game Pass",
    image: "/booster-pack/NUMS_GAME.png",
    rarity: "epic",
  },

  // Legendary (4% probability)
  {
    type: RewardType.GOLDEN_TOKEN,
    name: "Golden Token",
    image: "/booster-pack/GOLDEN_TOKEN.png",
    rarity: "legendary",
  },
  {
    type: RewardType.MYSTERY_ASSET,
    name: "Mystery Asset",
    image: "/booster-pack/MYSTERY_ASSET.png",
    rarity: "legendary",
  },

  // Special (1% probability)
  {
    type: RewardType.EXPLAINER,
    name: "Explainer",
    image: "/booster-pack/EXPLAINER.png",
    rarity: "legendary",
  },
];

// Rarity weights for probability distribution
const RARITY_WEIGHTS = {
  common: 60,
  rare: 25,
  epic: 10,
  legendary: 4,
};

/**
 * Simple hash function to convert string to number
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Deterministic pseudo-random number generator using seed
 */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Select a reward based on rarity weights
 */
function selectRewardByRarity(
  pool: Reward[],
  randomValue: number,
): Reward | null {
  const rarityRoll = randomValue * 100;
  let cumulativeWeight = 0;
  const rarityOrder: Array<"common" | "rare" | "epic" | "legendary"> = [
    "legendary",
    "epic",
    "rare",
    "common",
  ];

  for (const rarity of rarityOrder) {
    cumulativeWeight += RARITY_WEIGHTS[rarity];
    if (rarityRoll < cumulativeWeight) {
      const possibleRewards = pool.filter((r) => r.rarity === rarity);
      if (possibleRewards.length === 0) continue;
      const index = Math.floor(randomValue * 1000) % possibleRewards.length;
      return possibleRewards[index];
    }
  }

  // Fallback to common
  const commonRewards = pool.filter((r) => r.rarity === "common");
  return commonRewards[0] || pool[0];
}

/**
 * Compute rewards deterministically based on private key
 * @param privateKey - The private key from URL param
 * @param count - Number of rewards to generate (default: 3)
 * @returns Array of rewards
 */
export function computeRewards(
  privateKey: string,
  count: number = 3,
): Reward[] {
  const seed = hashString(privateKey);
  const rewards: Reward[] = [];
  const usedRewards = new Set<RewardType>();

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let reward: Reward | null = null;

    // Try to find unique reward (max 10 attempts to avoid infinite loop)
    while (attempts < 10) {
      const randomValue = seededRandom(seed, i * 100 + attempts);
      const candidateReward = selectRewardByRarity(REWARD_POOL, randomValue);

      if (candidateReward && !usedRewards.has(candidateReward.type)) {
        reward = candidateReward;
        usedRewards.add(candidateReward.type);
        break;
      }
      attempts++;
    }

    // If we couldn't find unique reward, just pick any
    if (!reward) {
      const randomValue = seededRandom(seed, i * 100);
      const index = Math.floor(randomValue * REWARD_POOL.length);
      reward = REWARD_POOL[index];
    }

    rewards.push(reward);
  }

  return rewards;
}

/**
 * Convert rewards to reward cards with reveal state
 */
export function createRewardCards(rewards: Reward[]): RewardCard[] {
  return rewards.map((reward) => ({
    ...reward,
    revealState: RevealState.UNREVEALED,
  }));
}

/**
 * Get rarity color for styling
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "legendary":
      return "#FFD700"; // Gold
    case "epic":
      return "#A335EE"; // Purple
    case "rare":
      return "#0070DD"; // Blue
    case "common":
    default:
      return "#9D9D9D"; // Gray
  }
}
