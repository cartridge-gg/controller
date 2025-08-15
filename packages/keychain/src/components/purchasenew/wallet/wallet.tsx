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
  const { onExternalConnect, clearError, displayError } = usePurchaseContext();
  const { wallets, isLoading: isWalletConnecting } = useWallets();
  const [chainId, setChainId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [availableWallets, setAvailableWallets] = useState<ExternalWallet[]>(
    [],
  );
  const selectedNetwork = networkWalletData.networks.find(
    (n) => n.platform === platformId,
  );

  useEffect(() => {
    if (!selectedNetwork || !wallets) {
      setAvailableWallets([]);
      setIsLoading(false);
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
    setIsLoading(false);
  }, [wallets, isMainnet, selectedNetwork]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);


  if (isLoading) {
    return <></>;
  }

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
        <LayoutContent>
          <div>No wallets found</div>
        </LayoutContent>
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
                await onExternalConnect(wallet, chainId);
                navigate(`/purchase/checkout/crypto`);
              }}
              className={
                isWalletConnecting ? "opacity-50 pointer-events-none" : ""
              }
            />
          );
        })}
      </LayoutContent>
     
      <LayoutFooter>
        {displayError && (
          <ErrorAlert title="Error" description={displayError.message} />
        )}
        <Button
          variant="secondary"
          onClick={goBack}
          disabled={isWalletConnecting}
        >
          Back
        </Button>
      </LayoutFooter>
    </>
  );
}
