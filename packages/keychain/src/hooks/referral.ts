import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  storeReferral,
  getReferral,
  hasValidReferral,
  clearReferral,
  type ReferralData,
} from "@/utils/referral";

/**
 * Hook to capture and manage referral tracking from URL parameters
 *
 * Automatically extracts ?ref= and ?ref_group= parameters from the URL,
 * stores them in localStorage with a 30-day attribution window per game,
 * and removes the parameters from the URL to keep it clean.
 *
 * The referring game is determined from document.referrer. If no valid
 * referrer is found, the referral is not stored.
 *
 * @example
 * ```tsx
 * function App() {
 *   useReferralCapture();
 *   // Referrals are automatically captured and stored per game
 * }
 * ```
 */
export function useReferralCapture(): void {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get("ref");
    const refGroup = searchParams.get("ref_group");

    // Only capture if ref parameter is present
    if (ref) {
      // Extract game URL from window.location.origin (strip https://)
      const gameUrl = window.location.origin.replace(/^https?:\/\//, "");

      if (gameUrl) {
        // Store the referral data for this specific game
        storeReferral(ref, gameUrl, refGroup || undefined);
      }

      // Remove referral parameters from URL to keep it clean
      searchParams.delete("ref");
      searchParams.delete("ref_group");

      // Reconstruct URL without referral params
      const newSearch = searchParams.toString();
      const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ""}${location.hash}`;

      // Replace current URL without adding to history
      navigate(newUrl, { replace: true });
    }
  }, [location.search, location.pathname, location.hash, navigate]);
}

/**
 * Hook to access referral data for a specific game
 *
 * @param gameUrl - Base URL of the game (e.g., "lootsurvivor.io")
 * @returns Current referral data if valid for this game, null otherwise
 */
export function useReferral(gameUrl: string): ReferralData | null {
  return getReferral(gameUrl);
}

/**
 * Hook to check if a valid referral exists for a specific game
 *
 * @param gameUrl - Base URL of the game (e.g., "lootsurvivor.io")
 * @returns true if a valid, non-expired referral exists for this game
 */
export function useHasReferral(gameUrl: string): boolean {
  return hasValidReferral(gameUrl);
}

/**
 * Hook that provides referral-related utilities for a specific game
 *
 * @param gameUrl - Base URL of the game (e.g., "lootsurvivor.io")
 * @example
 * ```tsx
 * function Component({ gameUrl }: { gameUrl: string }) {
 *   const { referral, hasReferral, clearReferral } = useReferralData(gameUrl);
 *
 *   if (hasReferral) {
 *     return <div>Referred by: {referral?.ref}</div>;
 *   }
 * }
 * ```
 */
export function useReferralData(gameUrl: string) {
  const referral = useReferral(gameUrl);
  const hasReferral = useHasReferral(gameUrl);

  const clear = useCallback(() => {
    clearReferral(gameUrl);
  }, [gameUrl]);

  return {
    referral,
    hasReferral,
    clearReferral: clear,
  };
}
