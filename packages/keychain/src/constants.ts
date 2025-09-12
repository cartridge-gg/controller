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
  "0x03F7F4E5a23A712787F0C100f02934c4A88606B7F0C880c2FD43e817E6275d83";
