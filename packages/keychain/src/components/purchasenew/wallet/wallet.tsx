import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PurchaseCard,
  WalletIcon,
} from "@cartridge/ui";
import { networkWalletData } from "./data";
import { useNavigation, usePurchaseContext } from "@/context";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ExternalWallet } from "@cartridge/controller";
import { useWallets } from "@/hooks/wallets";
import { useConnection } from "@/hooks/connection";
import { ErrorAlert } from "@/components/ErrorAlert";

export function SelectWallet() {
  const { goBack, navigate } = useNavigation();
  const { platformId } = useParams();
  const { isMainnet } = useConnection();
  const { onExternalConnect, clearError } = usePurchaseContext();
  const { wallets, isConnecting: isWalletConnecting } = useWallets();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState<string>();
  const [availableWallets, setAvailableWallets] = useState<ExternalWallet[]>(
    [],
  );
  const selectedNetwork = networkWalletData.networks.find(
    (n) => n.platform === platformId,
  );

  useEffect(() => {
    if (!selectedNetwork || !wallets) {
      setAvailableWallets([]);
      return;
    }

    // Filter detected wallets to only include those configured for this network
    const configuredWalletTypes = new Set(
      Array.from(selectedNetwork.wallets.keys()),
    );
    const matchingWallets = wallets.filter((detectedWallet) =>
      configuredWalletTypes.has(detectedWallet.type),
    );

    const chainId = selectedNetwork.chains?.find(
      (chain) => chain.isMainnet === isMainnet,
    )?.chainId;

    setChainId(chainId);
    setAvailableWallets(matchingWallets);
  }, [wallets, isMainnet, selectedNetwork]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  if (!selectedNetwork) {
    return (
      <>
        <HeaderInner
          title="Select a Wallet"
          icon={<WalletIcon variant="solid" size="lg" />}
        />
        <LayoutContent>
          <div>Network not found</div>
        </LayoutContent>
      </>
    );
  }

  if (availableWallets.length === 0) {
    return (
      <>
        <HeaderInner
          title={`Select a ${selectedNetwork.name} Wallet`}
          icon={<WalletIcon variant="solid" size="lg" />}
        />
        <LayoutFooter>
          <Button variant="secondary" onClick={goBack}>
            Back
          </Button>
        </LayoutFooter>
      </>
    );
  }

  return (
    <>
      <HeaderInner
        title={`Select a ${selectedNetwork.name} Wallet`}
        icon={<WalletIcon variant="solid" size="lg" />}
      />
      <LayoutContent>
        {availableWallets.map((wallet) => {
          // Get the configuration for this wallet type
          const walletConfig = selectedNetwork.wallets.get(wallet.type);

          return (
            <PurchaseCard
              key={wallet.type}
              text={walletConfig?.name || wallet.type}
              icon={walletConfig?.icon}
              network={selectedNetwork.name}
              networkIcon={selectedNetwork.subIcon}
              onClick={async () => {
                setIsLoading(true);
                try {
                  await onExternalConnect(
                    wallet,
                    selectedNetwork.platform,
                    chainId,
                  );
                  navigate(`/purchase/checkout/crypto`);
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
        })}
      </LayoutContent>

      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}
      </LayoutFooter>
    </>
  );
}
