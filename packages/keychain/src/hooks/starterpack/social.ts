import { useState, useCallback } from "react";
import { OAuthProvider } from "@/utils/api/generated";

export type SocialClaimStep =
  | "connect"
  | "follow"
  | "share"
  | "ready"
  | "claimed";

interface UseSocialClaimResults {
  isSocialClaim: boolean;
  socialProvider?: OAuthProvider;
  socialShareAccount?: string;
  socialClaimStep: SocialClaimStep;
  onSocialConnect?: () => void;
  onSocialFollow?: () => void;
  onSocialShare?: () => void;
}

export const useSocialClaim = (
  starterpackId?: number,
): UseSocialClaimResults => {
  const [socialClaimStep, setSocialClaimStep] =
    useState<SocialClaimStep>("connect");

  const isSocialClaim = starterpackId !== undefined;

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
    isSocialClaim,
    socialProvider: OAuthProvider.Twitter,
    socialShareAccount: "numsgg",
    socialClaimStep,
    onSocialConnect: socialClaimStep == "connect" ? onConnect : undefined,
    onSocialFollow: socialClaimStep == "follow" ? onFollow : undefined,
    onSocialShare: socialClaimStep == "share" ? onShare : undefined,
  };
};
