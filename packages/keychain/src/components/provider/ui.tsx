import { useAccount } from "@/hooks/account";
import { useConnection } from "@/hooks/connection";
import { OpenQrCodeEvent } from "@/wallets/wallet-connect";
import {
  AchievementPlayerAvatar,
  Dialog,
  DialogContent,
  UIProvider as Provider,
} from "@cartridge/ui";
import { QRCodeSVG } from "qrcode.react";
import { PropsWithChildren, useEffect, useState } from "react";
import { QRCodeOverlay } from "../connect/create/wallet-connect/qr-code-overlay";

function QrCodeDisplay({
  showQrCode,
  setShowQrCode,
  username,
}: {
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
        className="border-none h-full w-full flex flex-col items-center justify-center bg-translucent-dark-150 backdrop-blur-sm gap-8"
      >
        <p className="text-center select-none text-md bg-translucent-light-150 px-8 py-2 rounded-lg h-fit">
          {username}
        </p>
        <div className="p-4 bg-translucent-light-150 backdrop-blur-sm rounded-3xl">
          <div className="flex items-center justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg">
              <AchievementPlayerAvatar
                username={username}
                size="xl"
                className="bg-background-100"
              />
            </div>
            <div className="flex items-center justify-center w-[160px] h-[160px] bg-background-100">
              <QRCodeSVG
                level="L"
                value={`https://play.cartridge.gg/player/${username}`}
                size={144}
                bgColor="#00000000"
                fgColor="#ffffff"
                boostLevel={true}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UIProvider({ children }: PropsWithChildren) {
  const { controller, closeModal, openSettings, logout } = useConnection();
  const account = useAccount();
  const [showQrCode, setShowQrCode] = useState(false);
  const [overlay, setOverlay] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    window.addEventListener(
      "open-qr-code",
      (event: CustomEventInit<OpenQrCodeEvent>) => {
        const openQrCodeEvent = event.detail;
        if (openQrCodeEvent?.uri) {
          setOverlay(
            <QRCodeOverlay
              uri={openQrCodeEvent?.uri}
              onCancel={() => {
                setOverlay(null);
                window.dispatchEvent(new CustomEvent("qr-code-cancelled"));
              }}
            />,
          );
        }
      },
    );
  }, [setOverlay]);

  useEffect(() => {
    window.addEventListener("close-qr-code", () => {
      setOverlay(null);
    });
  }, [setOverlay]);

  return (
    <Provider
      value={{
        account:
          account && controller
            ? {
                username: account.username,
                address: controller.address(),
              }
            : undefined,
        chainId: controller?.chainId(),
        closeModal,
        openSettings,
        showQrCode: setShowQrCode,
        onLogout: logout,
      }}
    >
      {children}
      {account?.username ? (
        <QrCodeDisplay
          username={account?.username}
          showQrCode={showQrCode}
          setShowQrCode={setShowQrCode}
        />
      ) : null}
      {overlay}
    </Provider>
  );
}
