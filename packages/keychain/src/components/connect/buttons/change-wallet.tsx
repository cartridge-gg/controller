import { useWallets } from "@/hooks/wallets";
import { cn, WalletIcon } from "@cartridge/ui-next";
import { useMemo } from "react";
import { useUsernameValidation } from "../create/useUsernameValidation";
import {
  AuthenticationMethod,
  getControllerSignerAddress,
  getControllerSignerProvider,
} from "../types";

interface ChangeWalletProps {
  validation: ReturnType<typeof useUsernameValidation>;
}

const OPTIONS: Partial<
  Record<
    AuthenticationMethod,
    {
      label: string;
      color: string;
    }
  >
> = {
  metamask: {
    color: "text-wallet-theme-300",
    label: "MetaMask",
  },
  argent: {
    color: "text-wallet-theme-400",
    label: "Argent",
  },
  rabby: {
    color: "text-wallet-theme-200",
    label: "Rabby",
  },
  phantom: {
    color: "text-wallet-theme-100",
    label: "Phantom",
  },
  discord: {
    color: "text-wallet-theme-500",
    label: "Discord",
  },
  walletconnect: {
    color: "text-wallet-theme-600",
    label: "Wallet Connect",
  },
};

export function ChangeWallet({ validation }: ChangeWalletProps) {
  const { wallets } = useWallets();

  const signerProvider: AuthenticationMethod | undefined = useMemo(
    () => getControllerSignerProvider(validation.signer),
    [validation.signer],
  );
  const shouldChangeWallet = useMemo(() => {
    if (!validation.signer) {
      return false;
    }
    if (validation.signer.__typename === "WebauthnCredentials") {
      return false;
    }

    return !wallets
      .find(
        (wallet) =>
          wallet.type === getControllerSignerProvider(validation.signer),
      )
      ?.connectedAccounts?.find(
        (account) =>
          BigInt(account) ===
          BigInt(getControllerSignerAddress(validation.signer) || 0),
      );
  }, [validation.signer]);

  return (
    shouldChangeWallet && (
      <div
        className={cn(
          "w-fill h-[40px] flex items-center justify-between",
          "rounded border border-background-200 bg-background-125",
          "px-3 py-2.5 font-sans text-sm",
          OPTIONS[signerProvider as AuthenticationMethod]?.color,
        )}
      >
        <div className="w-fit h-fit flex items-center gap-1">
          <WalletIcon variant="solid" size="sm" />
          <div>
            Change {OPTIONS[signerProvider as AuthenticationMethod]?.label}{" "}
            Signer
          </div>
        </div>
      </div>
    )
  );
}
