import { PropsWithChildren, useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  UIProvider as Provider,
  TimesIcon,
} from "@cartridge/ui-next";
import { useConnection } from "#hooks/context";
import { useAccount } from "#hooks/account";
import { useArcade } from "#hooks/arcade.js";
import { useNavigate } from "react-router-dom";
import { QrCode } from "@cartridge/ui-next";

function QrCodeDisplay({
  address,
  showQrCode,
  setShowQrCode,
  username,
}: {
  address: string;
  showQrCode: boolean;
  username: string;
  setShowQrCode: (value: boolean) => void;
}) {
  const handleOpenChange = (open: boolean) => {
    setShowQrCode(open);
  };

  return (
    <Dialog open={showQrCode} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby="Your account address"
        className="border-none h-full w-full flex flex-col items-center justify-center bg-translucent-dark-150 backdrop-blur-lg gap-12"
      >
        <div className=" absolute left-4 top-4 p-2 bg-background-200 hover:bg-background-300 rounded-md">
          <TimesIcon />
        </div>

        <p className="text-center text-md bg-translucent-light-150 px-8 py-2 rounded-lg h-fit">
          {username}
        </p>
        <div className="p-5 bg-translucent-light-150 rounded-3xl">
          <QrCode data={`https://arcade.cartridge.gg/?address=${address}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UIProvider({ children }: PropsWithChildren) {
  const { followersCount, followedsCount } = useArcade();
  const { chainId, closeModal, openSettings } = useConnection();
  const account = useAccount();
  const [showQrCode, setShowQrCode] = useState(false);

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
        showQrCode: setShowQrCode,
      }}
    >
      {children}
      <QrCodeDisplay
        address={account?.address}
        username={account?.username}
        showQrCode={showQrCode}
        setShowQrCode={setShowQrCode}
      />
    </Provider>
  );
}
