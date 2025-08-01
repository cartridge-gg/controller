// Constants required to query the achievement events

export const TROPHY: string = "TrophyCreation";
export const PROGRESS: string = "TrophyProgression";
export const CARTRIDGE_DISCORD_LINK = "https://discord.gg/cartridge";
export const DEFAULT_SESSION_DURATION = BigInt(7 * 24 * 60 * 60);
export const now = () => BigInt(Math.floor(Date.now() / 1000));

// Marketplace constants

export const CLIENT_FEE_NUMERATOR = 250;
export const CLIENT_FEE_DENOMINATOR = 10_000;
export const CLIENT_FEE_RECEIVER =
  "0x041aad5a7493b75f240f418cb5f052d1a68981af21e813ed0a35e96d3e83123b";
