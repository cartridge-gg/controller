import { useState, useCallback, useEffect } from "react";
import {
  type OAuthConnection,
  OAuthProvider,
} from "@/utils/api/oauth-connections";
import { useOAuthConnection } from "@/components/settings/connections/use-connections";
import { useNavigation } from "@/context/navigation";

export type SocialClaimStep =
  | "connect"
  | "follow"
  | "share"
  | "ready"
  | "claimed";

interface UseSocialClaimResults {
  connection: OAuthConnection | undefined;
  isExpired: boolean;
  connectedHandle: string | null;
  socialClaimStep: SocialClaimStep;
  onSocialConnect?: () => void;
  onSocialFollow?: () => void;
  onSocialShare?: () => void;
}

export const useSocialClaim = (
  // starterpackId?: number,
  provider: OAuthProvider,
  accountToShare: string,
): UseSocialClaimResults => {
  const [socialClaimStep, setSocialClaimStep] =
    useState<SocialClaimStep>("connect");

  const { connection } = useOAuthConnection(provider);
  const isConnected = connection != null;
  const isExpired = connection?.isExpired ?? false;
  const connectedHandle = connection?.profile.providerUserId ?? null;

  const [hasFollowed, setHasFollowed] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    if (!isConnected || isExpired) {
      setSocialClaimStep("connect");
    } else if (!hasFollowed) {
      setSocialClaimStep("follow");
    } else if (!hasShared) {
      setSocialClaimStep("share");
    } else {
      setSocialClaimStep("ready");
    }
  }, [isConnected, isExpired, hasFollowed, hasShared]);

  const { navigate } = useNavigation();
  const onConnect = useCallback(() => {
    navigate(`/settings/add-connection?provider=${provider}`);
  }, [isConnected, isExpired, setSocialClaimStep]);

  const onFollow = useCallback(() => {
    setHasFollowed(true);
  }, [setSocialClaimStep]);

  const onShare = useCallback(() => {
    setHasShared(true);
  }, [setSocialClaimStep]);

  return {
    connection,
    isExpired,
    connectedHandle,
    socialClaimStep,
    onSocialConnect: socialClaimStep == "connect" ? onConnect : undefined,
    onSocialFollow: socialClaimStep == "follow" ? onFollow : undefined,
    onSocialShare: socialClaimStep == "share" ? onShare : undefined,
  };
};
