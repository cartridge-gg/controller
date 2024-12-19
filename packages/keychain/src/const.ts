export const CARTRIDGE_DISCORD_LINK = "https://discord.gg/cartridge";
export const SESSION_EXPIRATION = BigInt(
  Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
); // 1 week
export const DEFAULT_SESSION_DURATION = BigInt(7 * 24 * 60 * 60);
