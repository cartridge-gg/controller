import { PropsWithChildren, useCallback } from "react";
import { UIProvider as Provider } from "@cartridge/ui-next";
import { useConnection } from "#hooks/context";
import { useAccount } from "#hooks/account";
import { useArcade } from "#hooks/arcade.js";
import { useNavigate } from "react-router-dom";

export function UIProvider({ children }: PropsWithChildren) {
  const { followersCount, followedsCount } = useArcade();
  const { chainId, closeModal, openSettings } = useConnection();
  const account = useAccount();

  const navigate = useNavigate();

  const onFollowersClick = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("social", "followers");
    navigate(url.toString().replace(window.location.origin, ""));
  }, [navigate]);

  const onFollowingsClick = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("social", "following");
    navigate(url.toString().replace(window.location.origin, ""));
  }, [navigate]);

  return (
    <Provider
      value={{
        account: account
          ? {
              username: account.username,
              address: account.address,
            }
          : undefined,
        chainId,
        followers: followersCount,
        followings: followedsCount,
        onFollowersClick,
        onFollowingsClick,
        closeModal,
        openSettings,
      }}
    >
      {children}
    </Provider>
  );
}
