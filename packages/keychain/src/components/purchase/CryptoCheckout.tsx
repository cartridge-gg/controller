import {
  ArgentColorIcon,
  ArgentIcon,
  Button,
  Card,
  CardDescription,
  DepositIcon,
  EthereumIcon,
  LayoutContent,
  LayoutFooter,
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
  HeaderInner,
} from "@cartridge/ui";
import { useCallback, useMemo, useState } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ExternalWallet, humanizeString } from "@cartridge/controller";
import { useCryptoPayment } from "@/hooks/payments/crypto";
import { CostBreakdown } from "./CostBreakdown";
import { StarterPackDetails } from "@/hooks/starterpack";
import { Receiving } from "../starterpack/receiving";
import { creditsToUSD } from "@/hooks/tokens";
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

const CARTRIDGE_FEE = 0.025;

export function CryptoCheckout({
  selectedWallet,
  walletAddress,
  wholeCredits,
  starterpackDetails,
  teamId,
  initialState = CheckoutState.REVIEW_PURCHASE,
  onComplete,
}: {
  selectedWallet: ExternalWallet;
  walletAddress: string;
  wholeCredits: number;
  starterpackDetails?: StarterPackDetails;
  teamId?: string;
  initialState?: CheckoutState;
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

  const costUSDC = useMemo(() => {
    return starterpackDetails
      ? starterpackDetails.priceUsd
      : creditsToUSD(wholeCredits);
  }, [starterpackDetails, wholeCredits]);

  const handleSendTransaction = useCallback(async () => {
    setError(undefined);
    try {
      setState(CheckoutState.REQUESTING_PAYMENT);
      const paymentId = await sendPayment(
        walletAddress,
        wholeCredits,
        selectedWallet.platform!,
        teamId,
        starterpackDetails?.id,
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
  }, [sendPayment, selectedWallet, wholeCredits, onComplete]);

  return (
    <>
      <HeaderInner
        title={getTitle}
        icon={<DepositIcon variant="solid" size="lg" />}
        hideIcon
      />
      <LayoutContent className="gap-6">
        {starterpackDetails ? (
          <Receiving
            title={"Receiving"}
            items={starterpackDetails.starterPackItems}
            isLoading={state === CheckoutState.TRANSACTION_SUBMITTED}
          />
        ) : (
          <ReviewToken
            title={"Receiving"}
            name={"Credits"}
            icon={"https://static.cartridge.gg/presets/credit/icon.svg"}
            amount={wholeCredits.toLocaleString() + " Credits"}
            isLoading={state === CheckoutState.TRANSACTION_SUBMITTED}
          />
        )}
      </LayoutContent>

      <LayoutFooter>
        {(state === CheckoutState.REVIEW_PURCHASE ||
          state === CheckoutState.REQUESTING_PAYMENT) && (
          <CostBreakdown
            rails="crypto"
            paymentUnit="usdc"
            walletType={selectedWallet.type}
            price={{
              // TODO: hardcoding this for now, will come from backend
              processingFeeInCents: costUSDC * 100 * CARTRIDGE_FEE,
              baseCostInCents: costUSDC * 100,
              totalInCents: costUSDC * 100 * (1 + CARTRIDGE_FEE),
            }}
          />
        )}
        {error && (
          <ErrorAlert
            variant="error"
            title="Purchase Error"
            description={error.message}
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
              backgroundColor:
                WALLET_CONFIG[
                  selectedWallet!.type as keyof typeof WALLET_CONFIG
                ].bgColor,
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
    </>
  );
}

export const walletIcon = (wallet?: ExternalWallet, useColor = false) => {
  if (!wallet) {
    return null;
  }

  const Icon = useColor
    ? WALLET_CONFIG[wallet.type as keyof typeof WALLET_CONFIG].colorIcon
    : WALLET_CONFIG[wallet.type as keyof typeof WALLET_CONFIG].icon;
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
  value?: string;
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
      <TokenSummary className="rounded-tl-none rounded-tr-none">
        <TokenCard
          title={name}
          image={icon}
          amount={amount}
          value={value}
          className={"pointer-events-none"}
        />
      </TokenSummary>
    </Card>
  );
};
