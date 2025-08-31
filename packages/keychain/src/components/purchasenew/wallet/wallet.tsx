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
import { useEffect, useState, useMemo } from "react";
import { ExternalWallet } from "@cartridge/controller";
import { useWallets } from "@/hooks/wallets";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "@/components/ErrorAlert";
import {
  MerkleDropNetwork,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";

export function SelectWallet() {
  const { navigate } = useNavigation();
  const { platforms } = useParams();
  const { isMainnet } = useConnection();
  const { starterpackDetails, onExternalConnect, clearError } =
    usePurchaseContext();
  const { wallets, isConnecting: isWalletConnecting } = useWallets();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chainIds, setChainIds] = useState<Map<string, string>>(new Map());
  const [availableWallets, setAvailableWallets] = useState<
    Map<string, ExternalWallet[]>
  >(new Map());

  const selectedNetworks = useMemo(
    () =>
      platforms
        ?.split(";")
        .map((platform) =>
          networkWalletData.networks.find((n) => n.platform === platform),
        )
        .filter(Boolean) || [],
    [platforms],
  );

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

      if (matchingWallets.length > 0) {
        newAvailableWallets.set(network.platform, matchingWallets);
      }
    });

    setChainIds(newChainIds);
    setAvailableWallets(newAvailableWallets);
  }, [wallets, isMainnet, selectedNetworks]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

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
          if (!network || !availableWallets.has(network.platform)) return null;

          return availableWallets.get(network.platform)?.map((wallet) => {
            const walletConfig = network.wallets.get(wallet.type);

            return (
              <PurchaseCard
                key={`${network.platform}-${wallet.type}`}
                text={walletConfig?.name || wallet.type}
                icon={walletConfig?.icon}
                network={network.name}
                networkIcon={network.subIcon}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const address = await onExternalConnect(
                      wallet,
                      network.platform,
                      chainIds.get(network.platform),
                    );

                    if (
                      starterpackDetails?.acquisitionType ===
                      StarterpackAcquisitionType.Claimed
                    ) {
                      const key = starterpackDetails?.merkleDrops?.find(
                        (drop) =>
                          drop.network ===
                          (network.platform.toUpperCase() as MerkleDropNetwork),
                      )?.key;
                      navigate(`/purchase/claim/${key}/${address}`);
                    } else {
                      navigate(`/purchase/checkout/crypto`);
                    }
                  } catch (e) {
                    setError(e as Error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className={
                  isWalletConnecting || isLoading
                    ? "opacity-50 pointer-events-none"
                    : ""
                }
              />
            );
          });
        })}
      </LayoutContent>

      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}
      </LayoutFooter>
    </>
  );
}
