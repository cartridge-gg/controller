import { ExternalWallet } from "@cartridge/controller";
import {
  Button,
  CartridgeColorIcon,
  CreditCardIcon,
  WalletIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from "@cartridge/ui";
import { useWallets } from "@/hooks/wallets";
import { useMemo } from "react";
import { walletIcon } from "./CryptoCheckout";

export type PaymentMethodSelectionProps = {
  onBack: () => void;
  onControllerSelected: () => void;
  onCreditCardSelected: () => void;
  onWalletSelected: () => void;
  wallets?: ExternalWallet[];
  isStripeLoading?: boolean;
  isLoadingWallets?: boolean;
};

export function PaymentMethodSelection({
  onBack,
  onControllerSelected,
  onCreditCardSelected,
  onWalletSelected,
  wallets,
  isStripeLoading,
  isLoadingWallets,
}: PaymentMethodSelectionProps) {
  const {
    isConnecting,
    isLoading: isLoadingDetectedWallets,
    wallets: detectedWallets,
  } = useWallets();

  const availableWallets = useMemo(() => {
    const list = wallets ?? detectedWallets;
    // For now, support multiple wallets instead of just phantom
    return list.filter((w) => w.available);
  }, [wallets, detectedWallets]);

  const isLoading = isLoadingWallets || isLoadingDetectedWallets;

  return (
    <LayoutContainer>
      <LayoutHeader title="Choose Payment Method" onBack={onBack} />
      <LayoutContent className="gap-4">
        <Button
          className="flex justify-start items-center gap-3 h-12 bg-background-200 hover:bg-background-300 text-foreground-100"
          variant="secondary"
          onClick={onControllerSelected}
          disabled={isLoading}
        >
          <CartridgeColorIcon size="sm" />
          Controller
        </Button>

        <Button
          className="flex justify-start items-center gap-3 h-12 bg-background-200 hover:bg-background-300 text-foreground-100"
          variant="secondary"
          onClick={onCreditCardSelected}
          disabled={isStripeLoading || isLoading}
          isLoading={isStripeLoading}
        >
          <CreditCardIcon size="sm" variant="solid" />
          Credit Card
        </Button>

        <Button
          className="flex justify-start items-center gap-3 h-12 bg-background-200 hover:bg-background-300 text-foreground-100"
          variant="secondary"
          onClick={onWalletSelected}
          disabled={isConnecting || isLoading}
          isLoading={isConnecting}
        >
          <WalletIcon size="sm" variant="solid" />
          Wallet
          {availableWallets.length > 0 && (
            <div className="ml-auto flex items-center gap-1">
              {availableWallets.slice(0, 3).map((wallet) => (
                <div key={wallet.type} className="w-4 h-4">
                  {walletIcon(wallet, true)}
                </div>
              ))}
              {availableWallets.length > 3 && (
                <span className="text-xs text-foreground-400">
                  +{availableWallets.length - 3}
                </span>
              )}
            </div>
          )}
        </Button>
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </LayoutFooter>
    </LayoutContainer>
  );
}
