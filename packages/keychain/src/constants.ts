// Constants required to query the achievement events

export const TROPHY: string = "TrophyCreation";
export const PROGRESS: string = "TrophyProgression";
export const CARTRIDGE_DISCORD_LINK = "https://discord.gg/cartridge";
export const DEFAULT_SESSION_DURATION = BigInt(7 * 24 * 60 * 60);
export const now = () => BigInt(Math.floor(Date.now() / 1000));
