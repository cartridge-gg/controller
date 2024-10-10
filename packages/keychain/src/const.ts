export const CARTRIDGE_DISCORD_LINK = "https://discord.gg/cartridge";
export const SESSION_EXPIRATION = BigInt(
  Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60,
); // 1 week
