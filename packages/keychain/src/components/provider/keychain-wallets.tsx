import { OpenQrCodeEvent } from "@/wallets/wallet-connect";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DisplayType,
  SmsAuthentication,
} from "../connect/create/sms/sms-authentication";
import { QRCodeOverlay } from "../connect/create/wallet-connect/qr-code-overlay";

export interface KeychainWalletsInterface {
  setOtpDisplayType: (otpDisplayType: DisplayType | null) => void;
}

export const KeychainWalletsContext = createContext<
  KeychainWalletsInterface | undefined
>(undefined);

export function KeychainWalletsProvider({ children }: PropsWithChildren) {
  const [overlayUri, setOverlayUri] = useState<string | null>(null);
  const [otpDisplayType, setOtpDisplayType] = useState<DisplayType | null>(
    null,
  );

  useEffect(() => {
    window.addEventListener(
      "show-sms-authentication",
      (event: CustomEventInit<DisplayType>) => {
        if (event.detail !== undefined) {
          setOtpDisplayType(event.detail);
        }
      },
    );
  }, [setOtpDisplayType]);

  useEffect(() => {
    window.addEventListener(
      "open-qr-code",
      (event: CustomEventInit<OpenQrCodeEvent>) => {
        const openQrCodeEvent = event.detail;
        if (openQrCodeEvent?.uri) {
          setOverlayUri(openQrCodeEvent.uri);
        }
      },
    );
  }, [setOverlayUri]);

  useEffect(() => {
    window.addEventListener("close-qr-code", () => {
      setOverlayUri(null);
    });
  }, [setOverlayUri]);

  return (
    <KeychainWalletsContext.Provider value={{ setOtpDisplayType }}>
      {children}
      {otpDisplayType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <SmsAuthentication
              displayType={otpDisplayType}
              setOtpDisplayType={setOtpDisplayType}
            />
          </div>
        </div>
      )}
      {overlayUri && (
        <QRCodeOverlay
          uri={overlayUri}
          onCancel={() => {
            setOverlayUri(null);
            window.dispatchEvent(new CustomEvent("qr-code-cancelled"));
          }}
        />
      )}
    </KeychainWalletsContext.Provider>
  );
}

export const useKeychainWallets = () => {
  const context = useContext(KeychainWalletsContext);
  if (!context) {
    throw new Error(
      "useKeychainWallets must be used within a KeychainWalletsProvider",
    );
  }
  return context;
};
