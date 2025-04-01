import {
  ArgentColorIcon,
  ArgentIcon,
  Button,
  Card,
  CardDescription,
  DepositIcon,
  EthereumIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  MetaMaskColorIcon,
  MetaMaskIcon,
  PhantomColorIcon,
  PhantomIcon,
  StarknetIcon,
  SolanaIcon,
  ExternalIcon,
  CardTitle,
  CardHeader,
  TokenSummary,
  TokenCard,
  Spinner,
} from "@cartridge/ui-next";
import { useCallback, useMemo, useState } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ExternalWallet, humanizeString } from "@cartridge/controller";
import useCryptoPayment from "@/hooks/payment";
import { CostBreakdown } from "./CostBreakdown";

export const WALLET_CONFIG = {
  argent: {
    icon: ArgentIcon,
    colorIcon: ArgentColorIcon,
    network: "Starknet",
    networkIcon: StarknetIcon,
    bgColor: "#FF875B",
  },
  metamask: {
    icon: MetaMaskIcon,
    colorIcon: MetaMaskColorIcon,
    network: "Ethereum",
    networkIcon: EthereumIcon,
    bgColor: "#E88A39",
  },
  phantom: {
    icon: PhantomIcon,
    colorIcon: PhantomColorIcon,
    network: "Solana",
    networkIcon: SolanaIcon,
    bgColor: "#AB9FF2",
  },
} as const;

export enum CheckoutState {
  REVIEW_PURCHASE = 0,
  REQUESTING_PAYMENT = 1,
  TRANSACTION_SUBMITTED = 2,
}

export function CryptoCheckout({
  selectedWallet,
  walletAddress,
  creditsAmount,
  initialState = CheckoutState.REVIEW_PURCHASE,
  onBack,
  onComplete,
}: {
  selectedWallet: ExternalWallet;
  walletAddress: string;
  creditsAmount: number;
  initialState?: CheckoutState;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [error, setError] = useState<Error>();
  const { sendPayment, waitForPayment } = useCryptoPayment();
  const [state, setState] = useState<CheckoutState>(initialState);
  const [explorer, setExplorer] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const getTitle = useMemo(() => {
    switch (state) {
      case CheckoutState.REVIEW_PURCHASE:
        return "Review Purchase";
      case CheckoutState.REQUESTING_PAYMENT:
      case CheckoutState.TRANSACTION_SUBMITTED:
        return "Pending Confirmation";
    }
  }, [state]);

  const handleSendTransaction = useCallback(async () => {
    setError(undefined);
    try {
      setState(CheckoutState.REQUESTING_PAYMENT);
      const paymentId = await sendPayment(
        walletAddress,
        creditsAmount,
        selectedWallet.platform!,
        false,
        (explorer) => {
          setState(CheckoutState.TRANSACTION_SUBMITTED);
          setExplorer(explorer);
        },
      );

      await waitForPayment(paymentId);

      onComplete();
    } catch (error) {
      console.error(error);
      setError(error as Error);
    } finally {
      setState(CheckoutState.REVIEW_PURCHASE);
    }
  }, [sendPayment, selectedWallet, creditsAmount, onComplete]);

  return (
    <LayoutContainer>
      <LayoutHeader
        className="p-6"
        title={getTitle}
        icon={<DepositIcon variant="solid" size="lg" />}
        onBack={() => onBack()}
      />
      <LayoutContent className="gap-6 px-6">
        {state !== CheckoutState.TRANSACTION_SUBMITTED && (
          <ReviewToken
            title={"Spending"}
            name={"USDC"}
            icon={"https://static.cartridge.gg/tokens/usdc.svg"}
            amount={creditsAmount.toString() + " USDC"}
            value={"$" + creditsAmount.toString()}
          />
        )}

        <ReviewToken
          title={"Receiving"}
          name={"CREDITS"}
          icon={"https://static.cartridge.gg/presets/credit/icon.svg"}
          amount={creditsAmount.toString() + " Credits"}
          value={"$" + creditsAmount.toString()}
          isLoading={state === CheckoutState.TRANSACTION_SUBMITTED}
        />
      </LayoutContent>

      <LayoutFooter>
        {error && (
          <ErrorAlert
            variant="error"
            title="Purchase Alert"
            description={error.message}
          />
        )}

        {(state === CheckoutState.REVIEW_PURCHASE ||
          state === CheckoutState.REQUESTING_PAYMENT) && (
          <CostBreakdown
            rails="crypto"
            walletType={selectedWallet.type}
            price={{
              processingFeeInCents: 0,
              baseCostInCents: creditsAmount * 100,
              totalInCents: creditsAmount * 100,
            }}
          />
        )}
        {state === CheckoutState.TRANSACTION_SUBMITTED && (
          <Card className="bg-background-100 border border-background-200 p-3">
            <CardDescription className="flex flex-row items-start gap-3 items-center">
              <div className="flex justify-between w-full">
                <div className="text-foreground-200 font-normal text-xs flex items-center gap-1">
                  <Spinner size="sm" />
                  Confirming on {humanizeString(selectedWallet.platform!)}
                </div>
                <a
                  href={explorer?.url}
                  target="_blank"
                  className="flex items-center"
                >
                  <ExternalIcon size="sm" className="inline-block" />
                </a>
              </div>
            </CardDescription>
          </Card>
        )}
        {state !== CheckoutState.TRANSACTION_SUBMITTED && (
          <Button
            className="flex-1 text-background-100 hover:brightness-90"
            variant="secondary"
            style={{
              backgroundColor: WALLET_CONFIG[selectedWallet!.type].bgColor,
              border: "none",
            }}
            isLoading={state === CheckoutState.REQUESTING_PAYMENT}
            onClick={() => handleSendTransaction()}
          >
            {walletIcon(selectedWallet)}
            Purchase with {selectedWallet!.type}
          </Button>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}

export const walletIcon = (wallet?: ExternalWallet, useColor = false) => {
  if (!wallet) {
    return null;
  }

  const Icon = useColor
    ? WALLET_CONFIG[wallet.type].colorIcon
    : WALLET_CONFIG[wallet.type].icon;
  return <Icon />;
};

const ReviewToken = ({
  title,
  name,
  icon,
  amount,
  value,
  isLoading,
}: {
  title: string;
  name: string;
  icon: string;
  amount: string;
  value: string;
  isLoading?: boolean;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="normal-case font-semibold text-xs">
          {title}
        </CardTitle>
        {isLoading && <Spinner size="sm" />}
      </CardHeader>
      <TokenSummary>
        <TokenCard title={name} image={icon} amount={amount} value={value} />
      </TokenSummary>
    </Card>
  );
};
