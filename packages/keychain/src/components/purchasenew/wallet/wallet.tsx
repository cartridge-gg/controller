import {
  Button,
  Empty,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PurchaseCard,
  WalletIcon,
} from "@cartridge/ui";
import { networkWalletData, evmNetworks } from "./config";
import {
  useNavigation,
  useStarterpackContext,
  useOnchainPurchaseContext,
} from "@/context";
import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ExternalPlatform, ExternalWallet } from "@cartridge/controller";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Network } from "../types";
import { useConnection } from "@/hooks/connection";

export function SelectWallet() {
  const { navigate, goBack } = useNavigation();
  const { platforms } = useParams();
  const { controller, isMainnet, externalDetectWallets } = useConnection();
  const { starterpackDetails, clearError } = useStarterpackContext();
  const { onExternalConnect, clearSelectedWallet } =
    useOnchainPurchaseContext();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const [chainIds, setChainIds] = useState<Map<string, string>>(new Map());
  const [availableWallets, setAvailableWallets] = useState<
    Map<string, ExternalWallet[]>
  >(new Map());

  const selectedNetworks = useMemo(() => {
    let networks =
      platforms
        ?.split(";")
        .map((platform) =>
          networkWalletData.networks.find((n) => n.platform === platform),
        )
        .filter(Boolean) || [];

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

    return networks;
  }, [platforms, starterpackDetails]);

  useEffect(() => {
    if (!selectedNetworks.length) {
      setAvailableWallets(new Map());
      setIsDetecting(false);
      return;
    }

    const getWallets = async () => {
      setIsDetecting(true);
      const newAvailableWallets = new Map<string, ExternalWallet[]>();
      const newChainIds = new Map<string, string>();
      const wallets = await externalDetectWallets();

      selectedNetworks.forEach((network) => {
        if (!network) return;

        const configuredWalletTypes = new Set(
          Array.from(network.wallets.keys()),
        );
        const matchingWallets = wallets.filter(
          (detectedWallet) =>
            detectedWallet.available &&
            configuredWalletTypes.has(detectedWallet.type),
        );

        const chainId = network.chains?.find(
          (chain) => chain.isMainnet === isMainnet,
        )?.chainId;

        if (chainId) {
          newChainIds.set(network.platform, chainId);
        }

        if (matchingWallets.length > 0) {
          newAvailableWallets.set(network.platform, matchingWallets);
        }
      });

      setChainIds(newChainIds);
      setAvailableWallets(newAvailableWallets);
      setIsDetecting(false);
    };

    getWallets().catch((e) => {
      setError(e as Error);
      setIsDetecting(false);
    });
  }, [externalDetectWallets, isMainnet, selectedNetworks]);

  useEffect(() => {
    // Clear selected wallet when wallet selection screen mounts
    clearSelectedWallet();
    return () => clearError();
  }, [clearError, clearSelectedWallet]);

  const onControllerWalletSelect = useCallback(() => {
    if (starterpackDetails?.type === "claimed") {
      const keys = starterpackDetails?.merkleDrops
        ?.filter((drop) => drop.network === "STARKNET")
        .map((drop) => drop.key)
        .join(";");
      navigate(`/purchase/claim/${keys}/${controller!.address()}/controller`);
      return;
    }

    navigate(`/purchase/checkout/onchain`, { reset: true });
    return;
  }, [navigate, starterpackDetails, controller]);

  const onExternalWalletSelect = useCallback(
    async (wallet: ExternalWallet, network: Network) => {
      setIsLoading(true);
      try {
        const address = await onExternalConnect(
          wallet,
          network.platform,
          chainIds.get(network.platform),
        );

        if (starterpackDetails?.type === "claimed") {
          // Claim starterpack
          const isCurrentEvm = evmNetworks.includes(network.platform);

          const keys = starterpackDetails?.merkleDrops
            ?.filter((drop) => {
              const dropNetwork =
                drop.network.toLowerCase() as ExternalPlatform;

              // For EVM networks, include all EVM merkle drops
              if (isCurrentEvm) {
                return evmNetworks.includes(dropNetwork);
              }
              // For non-EVM networks, only include drops for that specific network
              return dropNetwork === network.platform;
            })
            .map((drop) => drop.key)
            .join(";");

          navigate(`/purchase/claim/${keys}/${address}/${wallet.type}`);
          return;
        }

        navigate(`/purchase/checkout/onchain`, { reset: true });
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [onExternalConnect, navigate, starterpackDetails, chainIds],
  );

  if (!selectedNetworks.length) {
    return (
      <>
        <HeaderInner
          title="Select a Wallet"
          icon={<WalletIcon variant="solid" size="lg" />}
        />
        <LayoutContent>
          <div>No networks found</div>
        </LayoutContent>
      </>
    );
  }

  // Check if there are any available wallets (including controller wallet for Starknet)
  const hasAnyWallets = selectedNetworks.some((network) => {
    if (!network) return false;

    // Check for Starknet controller wallet
    if (network.platform === "starknet" && network.wallets.has("controller")) {
      return true;
    }

    // Check for external wallets
    const wallets = availableWallets.get(network.platform);
    return wallets && wallets.length > 0;
  });

  if (isDetecting) {
    return <></>;
  }

  return (
    <>
      <HeaderInner
        title="Select a Wallet"
        icon={<WalletIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {!hasAnyWallets ? (
          <Empty
            icon="claim"
            title="No wallets detected"
            className="h-full md:h-[420px]"
          />
        ) : (
          selectedNetworks.map((network) => {
            if (!network) return null;

            const allwallets = availableWallets.get(network.platform) || [];
            const walletElements = [];

            // Add Controller wallet for Starknet
            if (network.platform === "starknet") {
              const controllerWallet = network.wallets.get("controller");
              if (controllerWallet) {
                walletElements.push(
                  <PurchaseCard
                    key={`${network.platform}-controller`}
                    text={controllerWallet.name}
                    icon={controllerWallet.icon}
                    network={network.name}
                    networkIcon={network.subIcon}
                    onClick={() => onControllerWalletSelect()}
                    className={
                      isLoading ? "opacity-50 pointer-events-none" : ""
                    }
                  />,
                );
              }
            }

            // Add other external wallets
            allwallets.forEach((wallet) => {
              const walletConfig = network.wallets.get(wallet.type);

              walletElements.push(
                <PurchaseCard
                  key={`${network.platform}-${wallet.type}`}
                  text={walletConfig?.name || wallet.type}
                  icon={walletConfig?.icon}
                  network={network.name}
                  networkIcon={network.subIcon}
                  onClick={() => onExternalWalletSelect(wallet, network)}
                  className={isLoading ? "opacity-50 pointer-events-none" : ""}
                />,
              );
            });

            return walletElements;
          })
        )}
      </LayoutContent>

      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}
        {!hasAnyWallets && (
          <Button variant="secondary" onClick={() => goBack()}>
            Cancel
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}
