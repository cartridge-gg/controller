import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import {
  getTwitterFollowUrl,
  type OAuthConnection,
  OAuthProvider,
} from "@/utils/api/oauth-connections";
import { useOAuthConnection } from "@/components/settings/connections/use-connections";
import { useNavigation } from "@/context/navigation";
import { useConnection } from "../connection";

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
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onSocialConnect?: () => void;
  onSocialFollow?: () => void;
  onSocialShare?: () => void;
}

export const useSocialClaim = (
  // starterpackId?: number,
  provider: OAuthProvider,
  accountToShare: string,
): UseSocialClaimResults => {
  const { controller } = useConnection();
  const username = controller?.username();

  const [socialClaimStep, setSocialClaimStep] =
    useState<SocialClaimStep>("connect");

  const { connection } = useOAuthConnection(provider);
  const isConnected = connection != null;
  const isExpired = connection?.isExpired ?? false;
  const connectedHandle = connection?.profile.username || connection?.profile.providerUserId || null;

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

  const followMutation = useMutation(
    async ({ username, accountToShare }: { username: string, accountToShare: string }) => {
      const url = getTwitterFollowUrl(username, accountToShare);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response;
    },
    {
      onSuccess: () => {
        setHasFollowed(true);
      },
      onError: (error: Error) => {
        // console.error(`FOLLOW ERROR:`, error.toString());
      }
    },
  );
  
  const onFollow = useCallback(() => {
    if (username && accountToShare) {
      followMutation.mutate({ username, accountToShare });
    }
  }, [followMutation, username, accountToShare, setHasFollowed]);

  const onShare = useCallback(() => {
    setHasShared(true);
    console.log(`TODO: share ${accountToShare}`);
  }, [setHasShared, accountToShare]);

  const error = useMemo(() => {
    if (followMutation.isError) {
      return (followMutation.error as Error).toString() || "Unknown error";
    }
    return null;
  }, [followMutation.isError, followMutation.error]);

  return {
    connection,
    isExpired,
    connectedHandle,
    socialClaimStep,
    isLoading: followMutation.isLoading,
    isError: followMutation.isError,
    error,
    onSocialConnect: socialClaimStep == "connect" ? onConnect : undefined,
    onSocialFollow: socialClaimStep == "follow" ? onFollow : undefined,
    onSocialShare: socialClaimStep == "share" ? onShare : undefined,
  };
};
