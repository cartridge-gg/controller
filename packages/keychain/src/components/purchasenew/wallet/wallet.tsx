import {
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PurchaseCard,
  WalletIcon,
} from "@cartridge/ui";
import { networkWalletData } from "./data";
import { useNavigation, usePurchaseContext } from "@/context";
import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ExternalWallet } from "@cartridge/controller";
import { useWallets } from "@/hooks/wallets";
import { ErrorAlert } from "@/components/ErrorAlert";
import {
  MerkleDropNetwork,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";
import { Network } from "../types";
import { useConnection } from "@/hooks/connection";

export function SelectWallet() {
  const { navigate } = useNavigation();
  const { platforms } = useParams();
  const { controller, isMainnet } = useConnection();
  const { starterpackDetails, onExternalConnect, clearError } =
    usePurchaseContext();
  const { wallets, isConnecting: isWalletConnecting } = useWallets();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    if (
      starterpackDetails?.acquisitionType ===
        StarterpackAcquisitionType.Claimed &&
      starterpackDetails.merkleDrops?.length
    ) {
      const supportedNetworkPlatforms = new Set(
        starterpackDetails.merkleDrops.map((drop) =>
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
    if (!selectedNetworks.length || !wallets) {
      setAvailableWallets(new Map());
      return;
    }

    const newAvailableWallets = new Map<string, ExternalWallet[]>();
    const newChainIds = new Map<string, string>();

    selectedNetworks.forEach((network) => {
      if (!network) return;

      const configuredWalletTypes = new Set(Array.from(network.wallets.keys()));
      const matchingWallets = wallets.filter((detectedWallet) =>
        configuredWalletTypes.has(detectedWallet.type),
      );

      const chainId = network.chains?.find(
        (chain) => chain.isMainnet === isMainnet,
      )?.chainId;

      if (chainId) {
        newChainIds.set(network.platform, chainId);
      }

      // For Starknet networks, always include Argent and Braavos wallets as fallback
      // even if they're not detected by the wallet detection mechanism
      if (network.platform === "starknet") {
        const starknetWallets = [...matchingWallets];

        // Add Argent wallet if not already detected
        if (!matchingWallets.some((wallet) => wallet.type === "argent")) {
          starknetWallets.push({
            type: "argent",
            available: true,
            platform: "starknet",
            name: "Argent",
          });
        }

        // Add Braavos wallet if not already detected
        if (!matchingWallets.some((wallet) => wallet.type === "braavos")) {
          starknetWallets.push({
            type: "braavos",
            available: true,
            platform: "starknet",
            name: "Braavos",
          });
        }

        if (starknetWallets.length > 0) {
          newAvailableWallets.set(network.platform, starknetWallets);
        }
      } else if (matchingWallets.length > 0) {
        newAvailableWallets.set(network.platform, matchingWallets);
      }
    });

    setChainIds(newChainIds);
    setAvailableWallets(newAvailableWallets);
  }, [wallets, isMainnet, selectedNetworks]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onControllerWalletSelect = useCallback(() => {
    if (
      starterpackDetails?.acquisitionType === StarterpackAcquisitionType.Paid
    ) {
      navigate(`/purchase/checkout/crypto`);
      return;
    }

    const keys = starterpackDetails?.merkleDrops
      ?.filter((drop) => drop.network === "STARKNET")
      .map((drop) => drop.key)
      .join(";");

    navigate(`/purchase/claim/${keys}/${controller!.address()}/controller`);
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

        if (
          starterpackDetails?.acquisitionType ===
          StarterpackAcquisitionType.Paid
        ) {
          navigate(`/purchase/checkout/crypto`);
          return;
        }

        // Claim starterpack
        const keys = starterpackDetails?.merkleDrops
          ?.filter(
            (drop) =>
              drop.network ===
              (network.platform.toUpperCase() as MerkleDropNetwork),
          )
          .map((drop) => drop.key)
          .join(";");

        navigate(`/purchase/claim/${keys}/${address}/${wallet.type}`);
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

  return (
    <>
      <HeaderInner
        title="Select a Wallet"
        icon={<WalletIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {selectedNetworks.map((network) => {
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
                    isWalletConnecting || isLoading
                      ? "opacity-50 pointer-events-none"
                      : ""
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
                className={
                  isWalletConnecting || isLoading
                    ? "opacity-50 pointer-events-none"
                    : ""
                }
              />,
            );
          });

          return walletElements;
        })}
      </LayoutContent>

      <LayoutFooter>
        {error && (
          <ErrorAlert
            title="Error"
            description={
              error.message.includes("Unknown error")
                ? error.message.replace("Unknown error", "Not available")
                : error.message
            }
          />
        )}
      </LayoutFooter>
    </>
  );
}
