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
} from "@cartridge/ui-next";
import { Balance, BalanceType } from "../Balance";
import { useCallback, useState } from "react";
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
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [explorer, setExplorer] = useState<{name: string, url: string} | null>(null);

  const getInfo = useCallback((wallet: ExternalWallet) => {
    const NetworkIcon = WALLET_CONFIG[wallet.type].networkIcon;

    if (explorer) {
      return (
        <>
          <div className="flex justify-between w-full">
            <p className="text-foreground-200 font-normal text-xs flex items-center">View on {explorer.name}</p>
            <a href={explorer.url} target="_blank" className="flex items-center">
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
  }, [explorer]);

  const handleSendTransaction = useCallback(async () => {
    try {
      setSendingTransaction(true);
      await sendPayment(
        walletAddress,
        creditsAmount,
        selectedWallet.platform!,
        false,
        (explorer) => setExplorer(explorer),
      );

      onComplete();
    } catch (error) {
      console.error(error);
      setError(error as Error);
    } finally {
      setSendingTransaction(false);
    }
  }, [sendPayment, selectedWallet, creditsAmount, onComplete]);

  return (
    <LayoutContainer>
      <LayoutHeader
        className="p-6"
        title={"Purchase Credits"}
        icon={<DepositIcon variant="solid" size="lg" />}
        onBack={() => onBack()}
      />
      <LayoutContent className="gap-6 px-6">
        <Balance types={[BalanceType.CREDITS]} />
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
        <Button
          className="flex-1 text-background-100 hover:brightness-90"
          variant="secondary"
          style={{
            backgroundColor: WALLET_CONFIG[selectedWallet!.type].bgColor,
            border: "none",
          }}
          isLoading={sendingTransaction}
          onClick={() => handleSendTransaction()}
        >
          {walletIcon(selectedWallet)}
          Purchase with {selectedWallet?.name}
        </Button>
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
