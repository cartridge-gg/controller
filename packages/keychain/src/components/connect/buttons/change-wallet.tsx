import { ErrorAlert } from "@/components/ErrorAlert";
import { useWallets } from "@/hooks/wallets";
import { AUTH_METHODS_LABELS } from "@/utils/connection/constants";
import { AuthOption } from "@cartridge/controller";
import { formatAddress } from "@cartridge/ui/utils";
import { useEffect, useMemo } from "react";
import { useUsernameValidation } from "../create/useUsernameValidation";
import { credentialToAddress, credentialToAuth } from "../types";

interface ChangeWalletProps {
  validation: ReturnType<typeof useUsernameValidation>;
  changeWallet: boolean;
  setChangeWallet: (value: boolean) => void;
  authMethod: AuthOption | undefined;
}

const OPTIONS: Partial<
  Record<
    AuthOption,
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
  google: {
    color: "text-wallet-theme-700",
    label: AUTH_METHODS_LABELS.google,
    isExtension: false,
  },
};

export function ChangeWallet({
  validation,
  changeWallet: externalChangeWallet,
  setChangeWallet,
  authMethod,
}: ChangeWalletProps) {
  const { wallets, isExtensionMissing } = useWallets();

  useEffect(() => {
    setChangeWallet(false);
  }, [validation.status, setChangeWallet]);

  const option = useMemo(() => {
    if (authMethod) {
      return OPTIONS[authMethod];
    }
    if (validation.signers && validation.signers.length === 1) {
      return OPTIONS[credentialToAuth(validation.signers[0])];
    }
  }, [authMethod, validation.signers]);

  const extensionMissingForSigner = useMemo(() => {
    if (!option) {
      return false;
    }
    if (!option?.isExtension) {
      return false;
    }

    if (authMethod) {
      return !wallets.some((wallet) => wallet.type === authMethod);
    }
    if (validation.signers) {
      return validation.signers.every((signer) => isExtensionMissing(signer));
    }
    return false;
  }, [option, wallets, authMethod, validation.signers, isExtensionMissing]);

  const shouldChangeWallet = (() => {
    if (!option) {
      return false;
    }
    if (!option?.isExtension) {
      return false;
    }
    if (!validation.signers) {
      return false;
    }
    const method = authMethod || credentialToAuth(validation.signers[0]);
    const walletProvider = wallets.find((wallet) => wallet.type === method);

    if (walletProvider?.connectedAccounts?.length === 0) {
      return false;
    }

    return !walletProvider?.connectedAccounts?.find((account) =>
      validation.signers?.some(
        (signer) =>
          BigInt(account) === BigInt(credentialToAddress(signer) || 0),
      ),
    );
  })();

  const possibleSigners = (() => {
    if (!validation.signers) {
      return [];
    }
    return validation.signers.filter(
      (signer) => credentialToAuth(signer) === authMethod,
    );
  })();

  const formatMultipleAddresses = (signers: typeof possibleSigners) => {
    if (signers.length === 0) return "";
    if (signers.length === 1) {
      return formatAddress(credentialToAddress(signers[0]) || "", {
        size: "xs",
      });
    }

    const addresses = signers.map((signer) =>
      formatAddress(credentialToAddress(signer) || "", { size: "xs" }),
    );

    if (addresses.length === 2) {
      return `${addresses[0]} or ${addresses[1]}`;
    }

    const allButLast = addresses.slice(0, -1);
    const last = addresses[addresses.length - 1];
    return `${allButLast.join(", ")} or ${last}`;
  };

  return (
    option &&
    (shouldChangeWallet ||
      extensionMissingForSigner ||
      externalChangeWallet) && (
      <ErrorAlert
        title={
          extensionMissingForSigner
            ? `${option?.label} wallet missing`
            : shouldChangeWallet
              ? `Connect to ${option?.label} Account`
              : `Change ${option?.label} Account`
        }
        allowToggle={false}
        isExpanded={false}
        variant="error"
        description={
          extensionMissingForSigner
            ? `We weren't able to detect the ${option?.label} wallet on your browser. Please install it to continue.`
            : shouldChangeWallet || possibleSigners
              ? `Please connect to ${option?.label} Account ${formatMultipleAddresses(possibleSigners)} to continue.`
              : `Please change your ${option?.label} Account to continue.`
        }
      />
    )
  );
}
