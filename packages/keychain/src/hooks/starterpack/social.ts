import { useState, useCallback, useEffect } from "react";
import {
  type OAuthConnection,
  OAuthProvider,
} from "@/utils/api/oauth-connections";
import { useOAuthConnection } from "@/components/settings/connections/use-connections";
import { useNavigation } from "@/context/navigation";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();

  const onConnect = useCallback(() => {
    navigate(
      `/settings/add-connection?provider=${provider}&returnTo=${location.pathname}`,
    );
  }, [provider, location.pathname, navigate]);

  const onFollow = useCallback(() => {
    setHasFollowed(true);
    console.log(`TODO: follow ${accountToShare}`);
  }, [setHasFollowed, accountToShare]);

  const onShare = useCallback(() => {
    setHasShared(true);
    console.log(`TODO: share ${accountToShare}`);
  }, [setHasShared, accountToShare]);

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
