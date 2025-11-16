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

// Token icon URLs

export const TOKEN_ICON_BASE_URL =
  "https://imagedelivery.net/0xPAQaDtnQhBs8IzYRIlNg";

export const TOKEN_ICONS = {
  USDC: `${TOKEN_ICON_BASE_URL}/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo`,
  STRK: `${TOKEN_ICON_BASE_URL}/1b126320-367c-48ed-cf5a-ba7580e49600/logo`,
  ETH: `${TOKEN_ICON_BASE_URL}/e07829b7-0382-4e03-7ecd-a478c5aa9f00/logo`,
  LORDS: `${TOKEN_ICON_BASE_URL}/a3bfe959-50c4-4f89-0aef-b19207d82a00/logo`,
  CREDITS: `${TOKEN_ICON_BASE_URL}/e5aaa970-a998-47e8-bd43-4a3b56b87200/logo`, // Using USDC icon for credits
} as const;
