import { PropsWithChildren, useCallback, useState } from "react";
import {
  AchievementPlayerAvatar,
  Dialog,
  DialogContent,
  UIProvider as Provider,
} from "@cartridge/ui";
import { useConnection } from "#hooks/context";
import { useAccount } from "#hooks/account";
import { useArcade } from "#hooks/arcade.js";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

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
        className="border-none h-full w-full flex flex-col items-center justify-center bg-translucent-dark-150 backdrop-blur-sm gap-12"
      >
        <p className="text-center select-none text-md bg-translucent-light-150 px-8 py-2 rounded-lg h-fit">
          {username}
        </p>
        <div className="p-5 bg-translucent-light-150 backdrop-blur-sm rounded-3xl">
          <div className="flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 p-2 bg-[#373837] -translate-x-1/2 -translate-y-1/2 rounded-lg">
              <AchievementPlayerAvatar username={username} size="xl" />
            </div>
            <QRCodeSVG
              level="L"
              value={`https://play.cartridge.gg/?address=${address}`}
              size={192}
              bgColor="#00000000"
              fgColor="#ffffff"
              boostLevel={true}
            />
          </div>
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
