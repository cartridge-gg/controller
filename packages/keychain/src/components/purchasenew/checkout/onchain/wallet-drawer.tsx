import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppleIcon,
  Button,
  cn,
  GlobeIcon,
  PurchaseCard,
  Sheet,
  SheetContent,
  SheetTitle,
  SpinnerIcon,
  Thumbnail,
  TimesIcon,
  WalletIcon,
} from "@cartridge/ui";
import { ExternalWallet } from "@cartridge/controller";
import { useOnchainPurchaseContext, useStarterpackContext } from "@/context";
import { useConnection } from "@/hooks/connection";
import { useFeature } from "@/hooks/features";
import { networkWalletData } from "../../wallet/config";
import { Network } from "../../types";

type DrawerStep = "network" | "wallet";

interface WalletSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletSelectionDrawer({
  isOpen,
  onClose,
}: WalletSelectionDrawerProps) {
  const isApplePayEnabled = useFeature("apple-pay-support");

  const { isMainnet, externalDetectWallets } = useConnection();
  const { starterpackDetails } = useStarterpackContext();
  const { onExternalConnect, clearSelectedWallet, onApplePaySelect } =
    useOnchainPurchaseContext();

  const [step, setStep] = useState<DrawerStep>("network");
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
      setStep("network");
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

  const handleNetworkSelect = useCallback((network: Network) => {
    setSelectedNetwork(network);
    setStep("wallet");
  }, []);

  const handleApplePaySelect = useCallback(async () => {
    onApplePaySelect();
    onClose();
  }, [onApplePaySelect, onClose]);

  const onControllerWalletSelect = useCallback(() => {
    clearSelectedWallet();
    onClose();
  }, [clearSelectedWallet, onClose]);

  const onExternalWalletSelect = useCallback(
    async (wallet: ExternalWallet, network: Network) => {
      setIsConnecting(true);
      setError(null);

      try {
        await onExternalConnect(
          wallet,
          network.platform,
          chainIds.get(network.platform),
        );
        onClose();
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsConnecting(false);
      }
    },
    [onExternalConnect, chainIds, onClose],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

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

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="flex flex-col bg-[#0F1410] w-full h-fit justify-end p-4 gap-4 border-t-0 rounded-tl-[16px] rounded-tr-[16px]"
        showClose={false}
      >
        <div className="flex items-center justify-between">
          <SheetTitle className="flex items-center gap-3 text-lg text-start font-semibold">
            {step === "network" ? (
              <>
                <Thumbnail icon={<GlobeIcon variant="solid" />} size="lg" />
                Choose Network
              </>
            ) : (
              <>
                <Thumbnail icon={<WalletIcon variant="solid" />} size="lg" />
                Select Wallet
              </>
            )}
          </SheetTitle>
          <Button
            variant="icon"
            size="icon"
            onClick={onClose}
            tabIndex={-1}
            className="rounded-full bg-background-100 hover:bg-background-200"
          >
            <TimesIcon size="sm" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {step === "network" ? (
            // Network selection step
            <>
              {isApplePayEnabled && (
                <div
                  key="apple-pay"
                  onClick={handleApplePaySelect}
                  className={cn(
                    "group flex flex-row gap-2 bg-background-200 hover:bg-background-300 rounded-lg p-3 justify-between cursor-pointer",
                    "rounded-lg",
                    isApplePayLoading && "opacity-50 pointer-events-none",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Thumbnail
                      icon={<AppleIcon />}
                      size="md"
                      className="bg-background-300 group-hover:bg-background-400"
                      rounded
                    />
                    <span>Apple Pay</span>
                  </div>
                  {isApplePayLoading && (
                    <div className="flex items-center">
                      <SpinnerIcon className="animate-spin" size="sm" />
                    </div>
                  )}
                </div>
              )}
              {selectedNetworks.length > 0 ? (
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
              )}
            </>
          ) : // Wallet selection step
          isDetecting ? (
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
