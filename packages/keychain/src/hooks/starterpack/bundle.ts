import { useMemo } from "react";
import { OAuthProvider } from "@/utils/api/oauth-connections";
import { StarterPackMetadataOnchain } from "./onchain";

export interface SocialClaimConditions {
  provider: OAuthProvider;
  targetAccount: string;
  targetAccountId: string | null;
}

export const useBundleConditions = (
  metadata: StarterPackMetadataOnchain | null,
) => {
  const socialClaimConditions = useMemo<
    SocialClaimConditions | undefined
  >(() => {
    const conditions = metadata?.conditions ?? [];
    if (conditions[0] === "social-claim") {
      const provider = conditions[1] as OAuthProvider;
      switch (provider) {
        case "TWITTER":
          return {
            provider,
            targetAccount: conditions[2],
            targetAccountId: conditions[3] ?? null,
          };
        case "TIKTOK": // not implemented
        case "INSTAGRAM": // not implemented
        default:
          return undefined;
      }
    }
    return undefined;
  }, [metadata]);

  return {
    socialClaimConditions,
  };
};
