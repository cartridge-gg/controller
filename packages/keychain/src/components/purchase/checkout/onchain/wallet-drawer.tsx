import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  AppleIcon,
  CreditCardIcon,
  DepositIcon,
  PurchaseCard,
  SpinnerIcon,
  WalletIcon,
  cn,
} from "@cartridge/controller-ui";
import { ExternalWallet } from "@cartridge/controller";
import { useStarterpackContext } from "@/context";
import { useConnection } from "@/hooks/connection";
import { useFeature } from "@/hooks/features";
import { posthog } from "@/components/provider/posthog";
import { captureAnalyticsEvent } from "@/types/analytics";
import { getWallet, networkWalletData } from "../../wallet/config";
import { Network } from "../../types";

type DrawerStep = "method" | "network" | "wallet";

// Display-oriented description of a chosen payment method. This is the shape
// both the onchain checkout and the credits checkout share to render a
// WalletSelector — see getPaymentMethodDisplay below.
export type PaymentMethod =
  | { type: "apple-pay" }
  | { type: "coinflow" }
  | { type: "controller" }
  | { type: "external"; wallet: ExternalWallet };

// What the selection drawer returns: a PaymentMethod plus the extra routing
// info the onchain flow needs to connect an external wallet. A
// PaymentMethodSelection is always assignable to PaymentMethod.
export type PaymentMethodSelection =
  | Exclude<PaymentMethod, { type: "external" }>
  | (Extract<PaymentMethod, { type: "external" }> & {
      network: Network;
      chainId?: string;
    });

// Single source of truth for the name + icon shown for a payment method.
export function getPaymentMethodDisplay(method: PaymentMethod | null): {
  name: string;
  icon: React.ReactNode;
} {
  switch (method?.type) {
    case "coinflow":
      return { name: "Credit Card", icon: <CreditCardIcon variant="solid" /> };
    case "apple-pay":
      return { name: "Apple Pay", icon: <AppleIcon /> };
    case "external": {
      const wallet = getWallet(method.wallet.type);
      return { name: wallet.name, icon: wallet.subIcon };
    }
    case "controller":
    default: {
      const wallet = getWallet("controller");
      return { name: wallet.name, icon: wallet.subIcon };
    }
  }
}

interface WalletSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setSelected: (method: PaymentMethodSelection) => Promise<void> | void;
  showFiatOptions?: boolean;
  showController?: boolean;
  showCrypto?: boolean;
}

export function WalletSelectionDrawer({
  isOpen,
  onClose,
  setSelected,
  showFiatOptions = true,
  showController = false,
  showCrypto = true,
}: WalletSelectionDrawerProps) {
  const isCoinflowEnabled = useFeature("coinflow-support");

  const { isMainnet, externalDetectWallets } = useConnection();
  const { starterpackDetails } = useStarterpackContext();

  const isAndroid = useMemo(
    () =>
      typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent),
    [],
  );

  const [step, setStep] = useState<DrawerStep>("method");
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isApplePayLoading, setIsApplePayLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [chainIds, setChainIds] = useState<Map<string, string>>(new Map());
  const [availableWallets, setAvailableWallets] = useState<
    Map<string, ExternalWallet[]>
  >(new Map());

  const selectedNetworks = useMemo(() => {
    const platforms = isMainnet
      ? ["starknet", "ethereum", "base", "arbitrum", "optimism"]
      : ["starknet"];

    let networks = platforms
      .map((platform) =>
        networkWalletData.networks.find((n) => n.platform === platform),
      )
      .filter(Boolean);

    // If acquisition type is claimed, filter networks to only show those with merkle drop support
    if (starterpackDetails?.type === "claimed") {
      const supportedNetworkPlatforms = new Set(
        starterpackDetails?.merkleDrops?.map((drop) =>
          drop.network.toLowerCase(),
        ),
      );

      networks = networks.filter(
        (network) => network && supportedNetworkPlatforms.has(network.platform),
      );
    }

    return networks as Network[];
  }, [isMainnet, starterpackDetails]);

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep("method");
      setSelectedNetwork(null);
      setError(null);
      setIsConnecting(false);
      setIsApplePayLoading(false);
    }
  }, [isOpen]);

  // Detect wallets when moving to wallet step
  useEffect(() => {
    if (!isOpen || step !== "wallet" || !selectedNetwork) {
      return;
    }

    const getWallets = async () => {
      setIsDetecting(true);
      setError(null);

      try {
        const newAvailableWallets = new Map<string, ExternalWallet[]>();
        const newChainIds = new Map<string, string>();
        const wallets = await externalDetectWallets();

        const configuredWalletTypes = new Set(
          Array.from(selectedNetwork.wallets.keys()),
        );
        const matchingWallets = wallets.filter(
          (detectedWallet) =>
            detectedWallet.available &&
            configuredWalletTypes.has(detectedWallet.type),
        );

        const chainId = selectedNetwork.chains?.find(
          (chain) => chain.isMainnet === isMainnet,
        )?.chainId;

        if (chainId) {
          newChainIds.set(selectedNetwork.platform, chainId);
        }

        if (matchingWallets.length > 0) {
          newAvailableWallets.set(selectedNetwork.platform, matchingWallets);
        }

        setChainIds(newChainIds);
        setAvailableWallets(newAvailableWallets);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsDetecting(false);
      }
    };

    getWallets();
  }, [isOpen, step, selectedNetwork, externalDetectWallets, isMainnet]);

  // step switcher

  const handleNetworkSelect = useCallback((network: Network) => {
    setSelectedNetwork(network);
    setStep("wallet");
  }, []);

  const handleWalletStepSelect = useCallback(() => {
    setStep("network");
  }, []);

  useEffect(() => {
    // select network when theres no fiat options
    if (
      step === "method" &&
      showCrypto &&
      !showFiatOptions &&
      !showController
    ) {
      setStep("network");
    }
  }, [step, showCrypto, showFiatOptions, showController, setStep]);

  // payment method selection

  const handleApplePaySelect = useCallback(async () => {
    captureAnalyticsEvent(posthog, "purchase_method_selected", {
      method: "apple-pay",
    });
    await setSelected({ type: "apple-pay" });
    onClose();
  }, [setSelected, onClose]);

  const handleCoinflowSelect = useCallback(async () => {
    captureAnalyticsEvent(posthog, "purchase_method_selected", {
      method: "coinflow",
    });
    await setSelected({ type: "coinflow" });
    onClose();
  }, [setSelected, onClose]);

  const onControllerWalletSelect = useCallback(async () => {
    captureAnalyticsEvent(posthog, "purchase_method_selected", {
      method: "controller-starknet",
    });
    await setSelected({ type: "controller" });
  }, [setSelected]);

  const onExternalWalletSelect = useCallback(
    async (wallet: ExternalWallet, network: Network) => {
      captureAnalyticsEvent(posthog, "purchase_method_selected", {
        method: `${wallet.type}-${network.platform}`,
      });
      setIsConnecting(true);
      setError(null);

      try {
        await setSelected({
          type: "external",
          wallet,
          network,
          chainId: chainIds.get(network.platform),
        });
        onClose();
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsConnecting(false);
      }
    },
    [setSelected, chainIds, onClose],
  );

  // Build wallet list elements for selected network
  const walletElements = useMemo(() => {
    if (!selectedNetwork) return [];

    const elements: React.ReactNode[] = [];
    const networkWallets = availableWallets.get(selectedNetwork.platform) || [];

    // Add Controller wallet for Starknet first
    if (selectedNetwork.platform === "starknet") {
      const controllerWallet = selectedNetwork.wallets.get("controller");
      if (controllerWallet) {
        elements.push(
          <PurchaseCard
            key={`${selectedNetwork.platform}-controller`}
            text={controllerWallet.name}
            icon={controllerWallet.icon}
            onClick={onControllerWalletSelect}
            className={cn(
              "rounded-lg",
              isConnecting && "opacity-50 pointer-events-none",
            )}
          />,
        );
      }
    }

    // Add other external wallets
    networkWallets.forEach((wallet) => {
      const walletConfig = selectedNetwork.wallets.get(wallet.type);

      elements.push(
        <PurchaseCard
          key={`${selectedNetwork.platform}-${wallet.type}`}
          text={walletConfig?.name || wallet.type}
          icon={walletConfig?.icon}
          onClick={() => onExternalWalletSelect(wallet, selectedNetwork)}
          className={cn(
            "rounded-lg",
            isConnecting && "opacity-50 pointer-events-none",
          )}
        />,
      );
    });

    return elements;
  }, [
    selectedNetwork,
    availableWallets,
    isConnecting,
    onControllerWalletSelect,
    onExternalWalletSelect,
  ]);

  const { title, icon } = useMemo(() => {
    switch (step) {
      case "network":
        return {
          title: "Choose Network",
          icon: <WalletIcon variant="solid" />,
        };
      case "wallet":
        return {
          title: "Choose Wallet",
          icon: <WalletIcon variant="solid" />,
        };
      case "method":
      default:
        return {
          title: "Payment Method",
          icon: <DepositIcon variant="solid" />,
        };
    }
  }, [step]);

  const controllerWallet = useMemo(() => {
    const wallet = getWallet("controller");
    return {
      ...wallet,
      platform: "starknet-controller",
    };
  }, []);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="bg-[#0F1410] gap-4">
      <DrawerContent title={title} icon={icon}>
        {step === "method" ? (
          <>
            {showFiatOptions && isCoinflowEnabled && (
              <PurchaseCard
                key="coinflow-checkout"
                text="Credit Card"
                icon={<CreditCardIcon variant="solid" />}
                onClick={handleCoinflowSelect}
                className={cn(
                  "group flex flex-row gap-2 bg-background-200 hover:bg-background-300 rounded-lg p-3 justify-between cursor-pointer",
                  "rounded-lg",
                  isApplePayLoading && "opacity-50 pointer-events-none",
                )}
              />
            )}
            {showFiatOptions && !isAndroid && (
              <PurchaseCard
                key="apple-pay"
                text="Apple Pay"
                icon={<AppleIcon />}
                onClick={handleApplePaySelect}
                className={cn(
                  "rounded-lg",
                  isApplePayLoading && "opacity-50 pointer-events-none",
                )}
              />
            )}
            {showController && (
              <PurchaseCard
                key={controllerWallet.platform}
                text={controllerWallet.name}
                icon={controllerWallet.icon}
                onClick={onControllerWalletSelect}
                className={cn(
                  "rounded-lg",
                  isApplePayLoading && "opacity-50 pointer-events-none",
                )}
              />
            )}
            {showCrypto && (
              <PurchaseCard
                key="wallet"
                text="Crypto"
                icon={<WalletIcon variant="solid" />}
                onClick={handleWalletStepSelect}
                className={cn(
                  "rounded-lg",
                  isApplePayLoading && "opacity-50 pointer-events-none",
                )}
              />
            )}
          </>
        ) : step === "network" ? (
          selectedNetworks.length > 0 ? (
            selectedNetworks.map((network) => (
              <PurchaseCard
                key={network.platform}
                text={network.name}
                icon={network.icon}
                onClick={() => handleNetworkSelect(network)}
                className={cn(
                  "rounded-lg",
                  isApplePayLoading && "opacity-50 pointer-events-none",
                )}
              />
            ))
          ) : (
            <div className="text-center text-foreground-300 py-8">
              No networks available
            </div>
          )
        ) : isDetecting ? (
          <div className="flex items-center justify-center py-8">
            <SpinnerIcon className="animate-spin" size="lg" />
          </div>
        ) : walletElements.length > 0 ? (
          walletElements
        ) : (
          <div className="text-center text-foreground-300 py-8">
            No wallets detected
          </div>
        )}

        {error && (
          <div className="text-destructive-100 text-sm mt-2">
            {error.message}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
