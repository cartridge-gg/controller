/**
 * Referral tracking and attribution utilities
 *
 * Supports tracking referrals from URL parameters (?ref= and ?ref_group=)
 * with a 30-day attribution window. Referrals are stored per-game based on
 * the referring domain.
 */

const REFERRAL_STORAGE_KEY = "@cartridge/referral";
const ATTRIBUTION_WINDOW_DAYS = 30;
const ATTRIBUTION_WINDOW_MS = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

/**
 * Referral data structure for a single game
 */
export interface ReferralData {
  /** Controller username of the referrer */
  ref: string;
  /** Optional referral group name */
  refGroup?: string;
  /** Timestamp when the referral expires (capturedAt + 30 days) */
  expiresAt: number;
  /** Timestamp when the referral was captured */
  capturedAt: number;
}

/**
 * Storage structure for multiple game referrals
 * Keyed by game base URL (e.g., { "lootsurvivor.io": { ref, refGroup, ... } })
 */
export interface ReferralStorage {
  [gameUrl: string]: ReferralData;
}

/**
 * Extract base domain from a URL
 * @param url - Full URL string
 * @returns Base domain (e.g., "lootsurvivor.io") or null if invalid
 */
export function extractGameUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove www. prefix if present
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Get all stored referrals
 * @returns Object with referrals keyed by game URL
 */
function getAllReferrals(): ReferralStorage {
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!stored) {
      return {};
    }
    return JSON.parse(stored) as ReferralStorage;
  } catch (error) {
    console.error("[Referral] Failed to load referrals:", error);
    return {};
  }
}

/**
 * Save all referrals to localStorage
 */
function saveAllReferrals(referrals: ReferralStorage): void {
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referrals));
  } catch (error) {
    console.error("[Referral] Failed to save referrals:", error);
  }
}

/**
 * Store referral attribution data for a specific game with a 30-day expiration window
 *
 * @param ref - Controller username of the referrer
 * @param gameUrl - Base URL of the referring game (e.g., "lootsurvivor.io")
 * @param refGroup - Optional referral group name
 * @returns The stored referral data
 */
export function storeReferral(
  ref: string,
  gameUrl: string,
  refGroup?: string,
): ReferralData {
  const now = Date.now();
  const referralData: ReferralData = {
    ref: ref.trim(),
    refGroup: refGroup?.trim(),
    capturedAt: now,
    expiresAt: now + ATTRIBUTION_WINDOW_MS,
  };

  try {
    const allReferrals = getAllReferrals();
    allReferrals[gameUrl] = referralData;
    saveAllReferrals(allReferrals);
  } catch (error) {
    console.error("[Referral] Failed to store referral data:", error);
  }

  return referralData;
}

/**
 * Retrieve stored referral data for a specific game if it exists and hasn't expired
 *
 * @param gameUrl - Base URL of the game (e.g., "lootsurvivor.io")
 * @returns Referral data if valid and not expired, null otherwise
 */
export function getReferral(gameUrl: string): ReferralData | null {
  try {
    const allReferrals = getAllReferrals();
    const referralData = allReferrals[gameUrl];

    if (!referralData) {
      return null;
    }

    const now = Date.now();

    // Check if referral has expired
    if (now > referralData.expiresAt) {
      clearReferral(gameUrl);
      return null;
    }

    return referralData;
  } catch (error) {
    console.error("[Referral] Failed to retrieve referral data:", error);
    return null;
  }
}

/**
 * Clear stored referral data for a specific game, or all referrals if no game specified
 *
 * @param gameUrl - Optional base URL of the game to clear. If not provided, clears all referrals
 */
export function clearReferral(gameUrl?: string): void {
  try {
    if (!gameUrl) {
      // Clear all referrals
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return;
    }

    // Clear specific game referral
    const allReferrals = getAllReferrals();
    delete allReferrals[gameUrl];
    saveAllReferrals(allReferrals);
  } catch (error) {
    console.error("[Referral] Failed to clear referral data:", error);
  }
}

/**
 * Check if a valid referral exists for a specific game
 *
 * @param gameUrl - Base URL of the game (e.g., "lootsurvivor.io")
 * @returns true if a valid, non-expired referral exists for this game
 */
export function hasValidReferral(gameUrl: string): boolean {
  return getReferral(gameUrl) !== null;
}

/**
 * Get the remaining days in the attribution window for a specific game
 *
 * @param gameUrl - Base URL of the game (e.g., "lootsurvivor.io")
 * @returns Number of days remaining, or null if no valid referral
 */
export function getRemainingAttributionDays(gameUrl: string): number | null {
  const referral = getReferral(gameUrl);
  if (!referral) {
    return null;
  }

  const now = Date.now();
  const remainingMs = referral.expiresAt - now;
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

/**
 * Get referral for the current game (from window.location.origin)
 *
 * @returns Referral data if a valid referral exists for the current game, null otherwise
 */
export function getCurrentReferral(): ReferralData | null {
  // Extract game URL from window.location.origin (strip https://)
  const gameUrl = window.location.origin.replace(/^https?:\/\//, "");
  if (!gameUrl) {
    return null;
  }
  return getReferral(gameUrl);
}

/**
 * Look up a Controller contract address by username using the GraphQL API
 *
 * @param username - The Controller username to look up
 * @returns Contract address if found, null otherwise
 */
export async function lookupReferrerAddress(
  username: string,
): Promise<string | null> {
  try {
    const apiUrl = `${import.meta.env.VITE_CARTRIDGE_API_URL}/query`;
    const query = `
      query AddressByUsername($username: String!) {
        account(username: $username) {
          controllers(first: 1) {
            edges {
              node {
                address
              }
            }
          }
        }
      }
    `;

    const response = await fetch(apiUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      console.error(
        "[Referral] GraphQL error looking up referrer:",
        json.errors[0]?.message,
      );
      return null;
    }

    const address =
      json.data?.account?.controllers?.edges?.[0]?.node?.address || null;

    if (!address) {
      return null;
    }

    return address;
  } catch (error) {
    console.error("[Referral] Failed to look up referrer address:", error);
    return null;
  }
}
