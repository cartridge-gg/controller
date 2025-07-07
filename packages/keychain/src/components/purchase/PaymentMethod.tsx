import { ExternalWallet } from "@cartridge/controller";
import { Button, CreditCardIcon, SparklesIcon } from "@cartridge/ui";
import { useWallets } from "@/hooks/wallets";
import { useMemo } from "react";
import { walletIcon } from "./CryptoCheckout";
import { MintAllowance, StarterPackDetails } from "@/hooks/starterpack";

export type PaymentMethodProps = {
  starterpackDetails?: StarterPackDetails;
  isStripeLoading: boolean;
  isStarterpackLoading: boolean;
  isClaiming: boolean;
  selectedWallet?: ExternalWallet;
  mintAllowance?: MintAllowance;
  wallets?: ExternalWallet[];
  onClaim: () => void;
  onCreditCard: () => void;
  onExternalConnect: (wallet: ExternalWallet) => void;
};

export function PaymentMethod({
  starterpackDetails,
  isStripeLoading,
  isStarterpackLoading,
  isClaiming,
  selectedWallet,
  mintAllowance,
  wallets,
  onClaim,
  onCreditCard,
  onExternalConnect,
}: PaymentMethodProps) {
  const {
    isConnecting,
    isLoading: isLoadingWallets,
    wallets: detectedWallets,
  } = useWallets();

  const availableWallets = useMemo(() => {
    const list = wallets ?? detectedWallets;
    const phantom = list.find((w) => w.type === "phantom");
    return phantom ? [phantom] : [];
  }, [wallets, detectedWallets]);

  const isOutOfStock = useMemo(() => {
    return (
      starterpackDetails?.supply !== undefined && starterpackDetails.supply <= 0
    );
  }, [starterpackDetails?.supply]);

  const isLimitReached = useMemo(() => {
    return mintAllowance && mintAllowance.count >= mintAllowance.limit;
  }, [mintAllowance]);

  const isFree = useMemo(() => {
    return starterpackDetails?.priceUsd === 0;
  }, [starterpackDetails?.priceUsd]);

  if (isStarterpackLoading) {
    return null;
  }

  if (isLimitReached) {
    return (
      <Button className="flex-1" disabled>
        Limit Reached
      </Button>
    );
  }

  if (isFree) {
    return (
      <Button className="flex-1" isLoading={isClaiming} onClick={onClaim}>
        <SparklesIcon size="sm" variant="solid" />
        Claim
      </Button>
    );
  }

  if (isOutOfStock) {
    return (
      <Button className="flex-1" disabled>
        Check again soon
      </Button>
    );
  }

  return (
    <>
      <Button
        className="flex-1"
        isLoading={isStripeLoading}
        onClick={onCreditCard}
        disabled={isLoadingWallets}
      >
        <CreditCardIcon
          size="sm"
          variant="solid"
          className="text-background-100 flex-shrink-0"
        />
        <span>Credit Card</span>
      </Button>
      <div className="flex flex-row gap-4">
        {availableWallets.map((wallet: ExternalWallet) => (
          <Button
            key={wallet.type}
            className="flex-1"
            variant="secondary"
            isLoading={isConnecting && wallet.type === selectedWallet?.type}
            disabled={
              !wallet.available ||
              isConnecting ||
              isStripeLoading ||
              isLoadingWallets
            }
            onClick={() => onExternalConnect(wallet)}
          >
            {walletIcon(wallet, true)}{" "}
            {availableWallets.length < 2 && wallet.type}
          </Button>
        ))}
      </div>
    </>
  );
}
