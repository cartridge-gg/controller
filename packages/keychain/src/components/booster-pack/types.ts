export enum RewardType {
  // Tokens
  CREDITS = "CREDITS_150000000000000000000",
  LORDS = "LORDS_75000000000000000000",
  NUMS = "NUMS_2000000000000000000000",
  PAPER = "PAPER_3000000000000000000000",
  SURVIVOR = "SURVIVOR_10000000000000000000",

  // NFTs
  BLOBERT = "BLOBERT_1",
  COSMETIC = "COSMETIC_1",
  REALM = "REALM_1",

  // Games
  LS2_BEAST = "LS2_BEAST",
  LS2_GAME = "LS2_GAME",
  NUMS_GAME = "NUMS_GAME",

  // Special
  GOLDEN_TOKEN = "GOLDEN_TOKEN",
  MYSTERY_ASSET = "MYSTERY_ASSET",
  EXPLAINER = "EXPLAINER",
}

export interface Reward {
  type: RewardType;
  name: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export enum RevealState {
  UNREVEALED = "unrevealed",
  REVEALING = "revealing",
  REVEALED = "revealed",
}

export interface RewardCard extends Reward {
  revealState: RevealState;
}
