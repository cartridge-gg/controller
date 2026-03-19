import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import {
  getTwitterFollowUrl,
  type OAuthConnection,
} from "@/utils/api/oauth-connections";
import { SocialClaimOptions } from "@cartridge/controller";
import { SocialClaimConditions } from "@/hooks/starterpack/onchain";
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
  options: SocialClaimOptions,
  conditions: SocialClaimConditions,
): UseSocialClaimResults => {
  const { controller } = useConnection();
  const username = controller?.username();

  const [socialClaimStep, setSocialClaimStep] =
    useState<SocialClaimStep>("connect");

  const { connection } = useOAuthConnection(conditions.provider);
  const isConnected = connection != null;
  const isExpired = connection?.isExpired ?? false;
  const connectedHandle =
    connection?.profile.username || connection?.profile.providerUserId || null;

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
      `/settings/add-connection?provider=${conditions.provider}&returnTo=${location.pathname}`,
    );
  }, [conditions.provider, location.pathname, navigate]);

  const followMutation = useMutation(
    async ({
      username,
      targetAccount,
      targetAccountId,
    }: {
      username: string;
      targetAccount: string;
      targetAccountId: string;
    }) => {
      const url = getTwitterFollowUrl(username, targetAccount, targetAccountId);
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
    },
  );

  const onFollow = useCallback(() => {
    if (username && conditions.targetAccount) {
      followMutation.mutate({
        username,
        targetAccount: conditions.targetAccount,
        targetAccountId: conditions.targetAccountId ?? "",
      });
    }
  }, [
    followMutation,
    username,
    conditions.targetAccount,
    conditions.targetAccountId,
  ]);

  const shareMessage = useMemo(() => {
    const result =
      options?.shareMessage ||
      `I got got a free game from @${conditions.targetAccount}! Check it out!`;
    return result;
  }, [options?.shareMessage, conditions.targetAccount]);

  const [isSharing, setIsSharing] = useState(false);

  const onShare = useCallback(() => {
    setIsSharing(true);
    try {
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;

      const width = 600;
      const height = 450;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        shareUrl,
        "twitter-share",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // poll for popup closure
      const pollTimer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          setIsSharing(false);
          setHasShared(true);
        }
      }, 500);
    } catch (error) {
      console.error(error);
      setIsSharing(false);
    }
  }, [setHasShared, shareMessage]);

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
    isLoading: followMutation.isLoading || isSharing,
    isError: followMutation.isError,
    error,
    onSocialConnect: socialClaimStep == "connect" ? onConnect : undefined,
    onSocialFollow: socialClaimStep == "follow" ? onFollow : undefined,
    onSocialShare: socialClaimStep == "share" ? onShare : undefined,
  };
};
