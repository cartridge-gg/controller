import { ErrorAlert } from "@/components/ErrorAlert";
import { useWallets } from "@/hooks/wallets";
import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { useEffect, useMemo } from "react";
import { useUsernameValidation } from "../create/useUsernameValidation";
import {
  AuthenticationMethod,
  getControllerSignerAddress,
  getControllerSignerProvider,
} from "../types";

interface ChangeWalletProps {
  validation: ReturnType<typeof useUsernameValidation>;
  changeWallet: boolean;
  setChangeWallet: (value: boolean) => void;
}

const OPTIONS: Partial<
  Record<
    AuthenticationMethod,
    {
      label: string;
      color: string;
      isExtension: boolean;
    }
  >
> = {
  metamask: {
    color: "text-wallet-theme-300",
    label: AUTH_METHODS_LABELS.metamask,
    isExtension: true,
  },
  argent: {
    color: "text-wallet-theme-400",
    label: AUTH_METHODS_LABELS.argent,
    isExtension: true,
  },
  rabby: {
    color: "text-wallet-theme-200",
    label: AUTH_METHODS_LABELS.rabby,
    isExtension: true,
  },
  phantom: {
    color: "text-wallet-theme-100",
    label: AUTH_METHODS_LABELS.phantom,
    isExtension: true,
  },
  discord: {
    color: "text-wallet-theme-500",
    label: AUTH_METHODS_LABELS.discord,
    isExtension: false,
  },
  walletconnect: {
    color: "text-wallet-theme-600",
    label: AUTH_METHODS_LABELS.walletconnect,
    isExtension: false,
  },
};

export function ChangeWallet({
  validation,
  changeWallet: externalChangeWallet,
  setChangeWallet,
}: ChangeWalletProps) {
  const { wallets } = useWallets();

  useEffect(() => {
    setChangeWallet(false);
  }, [validation.status]);

  const signerProvider: AuthenticationMethod | undefined = useMemo(
    () => getControllerSignerProvider(validation.signer),
    [validation.signer],
  );

  const option = useMemo(
    () => OPTIONS[signerProvider as AuthenticationMethod],
    [signerProvider],
  );

  const extensionMissingForSigner = useMemo(() => {
    if (option?.isExtension) {
      return !wallets.some(
        (wallet) =>
          wallet.type === getControllerSignerProvider(validation.signer),
      );
    }
    return false;
  }, [option?.isExtension, wallets, validation.signer]);

  const shouldChangeWallet = useMemo(() => {
    if (!option?.isExtension) {
      return false;
    }
    if (!validation.signer) {
      return false;
    }
    if (validation.signer.__typename === "WebauthnCredentials") {
      return false;
    }
    const walletProvider = wallets.find(
      (wallet) =>
        wallet.type === getControllerSignerProvider(validation.signer),
    );

    return !walletProvider?.connectedAccounts?.find(
      (account) =>
        BigInt(account) ===
        BigInt(getControllerSignerAddress(validation.signer) || 0),
    );
  }, [validation.signer, wallets]);

  return (
    (shouldChangeWallet ||
      extensionMissingForSigner ||
      externalChangeWallet) && (
      <ErrorAlert
        title={
          extensionMissingForSigner
            ? `${option?.label} wallet missing`
            : shouldChangeWallet
              ? `Connect to ${option?.label} Account ${truncateAddress(getControllerSignerAddress(validation.signer) || "")}`
              : `Change ${option?.label} Account`
        }
        allowToggle={false}
        isExpanded={false}
        variant="error"
        description={
          extensionMissingForSigner
            ? `We weren't able to detect the ${option?.label} wallet on your browser. Please install it to continue.`
            : shouldChangeWallet
              ? `Please connect to ${option?.label} Account ${truncateAddress(getControllerSignerAddress(validation.signer) || "")} to continue.`
              : `Please change your ${option?.label} account to continue.`
        }
      />
    )
  );
}

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
