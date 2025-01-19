export const CARTRIDGE_DISCORD_LINK = "https://discord.gg/cartridge";
export const DEFAULT_SESSION_DURATION = BigInt(7 * 24 * 60 * 60);
export const NOW = BigInt(Math.floor(Date.now() / 1000));
export const SESSION_EXPIRATION = NOW + DEFAULT_SESSION_DURATION; // 1 week
