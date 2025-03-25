import {
  ArgentColorIcon,
  ArgentIcon,
  Button,
  Card,
  CardDescription,
  DepositIcon,
  EthereumIcon,
  InfoIcon,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  MetaMaskColorIcon,
  MetaMaskIcon,
  PhantomColorIcon,
  PhantomIcon,
  Separator,
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
import { ExternalWallet } from "@cartridge/controller";
import useCryptoPayment from "@/hooks/payment";

const WALLET_CONFIG = {
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

enum State {
  REVIEW_PURCHASE = 0,
  REQUESTING_PAYMENT = 1,
  TRANSACTION_SUBMITTED = 2,
}

export function CryptoCheckout({
  selectedWallet,
  walletAddress,
  creditsAmount,
  onBack,
  onComplete,
}: {
  selectedWallet: ExternalWallet;
  walletAddress: string;
  creditsAmount: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [error, setError] = useState<Error>();
  const { sendPayment } = useCryptoPayment();
  const [state, setState] = useState<State>(State.REVIEW_PURCHASE);
  const [explorer, setExplorer] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const getInfo = useCallback(
    (wallet: ExternalWallet) => {
      const NetworkIcon = WALLET_CONFIG[wallet.type].networkIcon;

      if (explorer) {
        return (
          <>
            <div className="flex justify-between w-full">
              <p className="text-foreground-200 font-normal text-xs flex items-center">
                View on {explorer.name}
              </p>
              <a
                href={explorer.url}
                target="_blank"
                className="flex items-center"
              >
                <ExternalIcon size="sm" className="inline-block" />
              </a>
            </div>
          </>
        );
      }

      return (
        <>
          <InfoIcon size="sm" className="text-foreground-200 flex-shrink-0" />
          <p className="text-foreground-200 font-normal text-xs">
            Purchase funds on <NetworkIcon size="xs" className="inline-block" />{" "}
            {WALLET_CONFIG[wallet.type].network}
          </p>
        </>
      );
    },
    [explorer],
  );

  const getTitle = useMemo(() => {
    switch (state) {
      case State.REVIEW_PURCHASE:
        return "Review Purchase";
      case State.REQUESTING_PAYMENT:
      case State.TRANSACTION_SUBMITTED:
        return "Pending Confirmation";
    }
  }, [state]);

  const handleSendTransaction = useCallback(async () => {
    setError(undefined);
    try {
      setState(State.REQUESTING_PAYMENT);
      await sendPayment(
        walletAddress,
        creditsAmount,
        selectedWallet.platform!,
        false,
        (explorer) => {
          setExplorer(explorer);
        },
      );

      onComplete();
      setState(State.TRANSACTION_SUBMITTED);
    } catch (error) {
      console.error(error);
      setError(error as Error);
    } finally {
      setState(State.REVIEW_PURCHASE);
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
        {state !== State.TRANSACTION_SUBMITTED && (
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
        />
      </LayoutContent>

      <div className="m-1 mx-6">
        <Separator className="bg-spacer" />
      </div>

      <LayoutFooter>
        {error && (
          <ErrorAlert
            variant="warning"
            title="Purchase Alert"
            description={error.message}
          />
        )}

        <Card className="bg-background-100 border border-background-200 p-3">
          <CardDescription className="flex flex-row items-start gap-3 items-center">
            {getInfo(selectedWallet)}
          </CardDescription>
        </Card>
        {state !== State.TRANSACTION_SUBMITTED && (
          <Button
            className="flex-1 text-background-100 hover:brightness-90"
            variant="secondary"
            style={{
              backgroundColor: WALLET_CONFIG[selectedWallet!.type].bgColor,
              border: "none",
            }}
            isLoading={state === State.REQUESTING_PAYMENT}
            onClick={() => handleSendTransaction()}
          >
            {walletIcon(selectedWallet)}
            Purchase with {selectedWallet?.name}
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
