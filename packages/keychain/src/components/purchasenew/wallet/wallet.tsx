import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  PaymentCard,
  WalletIcon,
} from "@cartridge/ui";
import { networkWalletData } from "./data";
import { useNavigation, usePurchaseContext } from "@/context";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ExternalWallet } from "@cartridge/controller";

export function SelectWallet() {
  const { goBack, navigate } = useNavigation();
  const { platformId } = useParams();
  const { onExternalConnect, wallets, isWalletConnecting } =
    usePurchaseContext();
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

    setAvailableWallets(matchingWallets);
    setIsLoading(false);
  }, [wallets, selectedNetwork]);

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
            <PaymentCard
              key={wallet.type}
              text={walletConfig?.name || wallet.type}
              icon={walletConfig?.icon}
              network={selectedNetwork.name}
              networkIcon={selectedNetwork.subIcon}
              onClick={async () => {
                await onExternalConnect(wallet);
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
