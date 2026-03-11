import { useState, useCallback } from "react";
import {
  type OAuthConnection,
  OAuthProvider,
} from "@/utils/api/oauth-connections";
import { useOAuthConnection } from "@/components/settings/connections/use-connections";

export type SocialClaimStep =
  | "connect"
  | "follow"
  | "share"
  | "ready"
  | "claimed";

interface UseSocialClaimResults {
  connection: OAuthConnection | undefined;
  socialClaimStep: SocialClaimStep;
  onSocialConnect?: () => void;
  onSocialFollow?: () => void;
  onSocialShare?: () => void;
  isExpired: boolean;
}

export const useSocialClaim = (
  // starterpackId?: number,
  provider: OAuthProvider,
  accountToShare: string,
): UseSocialClaimResults => {
  const [socialClaimStep, setSocialClaimStep] =
    useState<SocialClaimStep>("connect");

  const { connection } = useOAuthConnection(provider);

  const onConnect = useCallback(() => {
    setSocialClaimStep("follow");
  }, [setSocialClaimStep]);

  const onFollow = useCallback(() => {
    setSocialClaimStep("share");
  }, [setSocialClaimStep]);

  const onShare = useCallback(() => {
    setSocialClaimStep("ready");
  }, [setSocialClaimStep]);

  return {
    connection,
    isExpired: connection?.isExpired ?? false,
    socialClaimStep,
    onSocialConnect: socialClaimStep == "connect" ? onConnect : undefined,
    onSocialFollow: socialClaimStep == "follow" ? onFollow : undefined,
    onSocialShare: socialClaimStep == "share" ? onShare : undefined,
  };
};
