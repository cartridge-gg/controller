import { ErrorAlert } from "@/components/ErrorAlert";
import { useConnection } from "@/hooks/connection";
import {
  ArgentColorIcon,
  ArgentIcon,
  Button,
  Card,
  CardDescription,
  CheckIcon,
  CreditCardIcon,
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
} from "@cartridge/ui-next";
import { isIframe } from "@cartridge/utils";
import { Elements } from "@stripe/react-stripe-js";
import { type Appearance, loadStripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AmountSelection } from "./AmountSelection";
import { Balance, BalanceType } from "./Balance";
import CheckoutForm from "./StripeCheckout";
import { DEFAULT_AMOUNT } from "./constants";
import { ExternalWallet } from "@cartridge/controller";

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

enum PurchaseState {
  SELECTION = 0,
  STRIPE_CHECKOUT = 1,
  CRYPTO_CHECKOUT = 2,
  SUCCESS = 3,
}

type PurchaseCreditsProps = {
  isSlot?: boolean;
  onBack?: () => void;
};

export function PurchaseCredits({ onBack }: PurchaseCreditsProps) {
  const {
    closeModal,
    controller,
    externalDetectWallets,
    externalConnectWallet,
    externalSignMessage,
  } = useConnection();

  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [state, setState] = useState<PurchaseState>(PurchaseState.SELECTION);
  const [creditsAmount, setCreditsAmount] = useState<number>(DEFAULT_AMOUNT);
  const [externalWallets, setExternalWallets] = useState<ExternalWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<ExternalWallet>();
  const [connecting, setConnecting] = useState<boolean>(false);
  const stripePromise = useMemo(
    () => loadStripe(import.meta.env.VITE_STRIPE_API_PUBKEY),
    [],
  );
  const [error, setError] = useState<Error>();

  useEffect(() => {
    externalDetectWallets().then((wallets) => setExternalWallets(wallets));
  }, [externalDetectWallets]);

  const onAmountChanged = useCallback(
    (amount: number) => setCreditsAmount(amount),
    [setCreditsAmount],
  );

  const createPaymentIntent = useCallback(async () => {
    if (!controller) {
      return;
    }

    setisLoading(true);

    try {
      const res = await fetch(import.meta.env.VITE_STRIPE_PAYMENT!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: creditsAmount,
          username: controller.username(),
        }),
      });
      if (!res.ok) {
        setError(new Error("Payment intent endpoint failure"));
        return;
      }
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setState(PurchaseState.STRIPE_CHECKOUT);
    } catch (e) {
      setError(e as unknown as Error);
    } finally {
      setisLoading(false);
    }
  }, [controller, creditsAmount]);

  const onExternalConnect = useCallback(
    async (wallet: ExternalWallet) => {
      try {
        setConnecting(true);
        setSelectedWallet(wallet);
        const res = await externalConnectWallet(wallet.type);
        if (res.success) {
          setState(PurchaseState.CRYPTO_CHECKOUT);
        } else {
          setError(new Error(res.error));
        }
      } catch (e) {
        setError(e as unknown as Error);
      } finally {
        setConnecting(false);
      }
    },
    [externalConnectWallet],
  );

  const title = useMemo(() => {
    switch (state) {
      case PurchaseState.SELECTION:
        return "Purchase Credits";
      case PurchaseState.CRYPTO_CHECKOUT:
        if (selectedWallet) {
          return `Purchase Credits`;
        }
        
        return "Connect Wallet";
      case PurchaseState.STRIPE_CHECKOUT:
        return "Credit Card";
      case PurchaseState.SUCCESS:
        return "Purchase Complete";
    }
  }, [state, selectedWallet]);

  const getWalletIcon = (wallet?: ExternalWallet, useColor = false) => {
    if (!wallet) {
      return null;
    }

    const Icon = useColor
      ? WALLET_CONFIG[wallet.type].colorIcon
      : WALLET_CONFIG[wallet.type].icon;
    return <Icon />;
  };

  const getWalletBgColor = (wallet: ExternalWallet) => {
    return WALLET_CONFIG[wallet.type].bgColor;
  };

  const getInfo = (wallet?: ExternalWallet) => {
    if (!wallet) {
      return <>Credits are used to pay for network activity. They are not tokens and cannot be transferred or refunded.</>;
    }

    const NetworkIcon = WALLET_CONFIG[wallet.type].networkIcon;
    return (
      <>
        Purchase funds on <NetworkIcon size="sm" className="inline-block" /> {WALLET_CONFIG[wallet.type].network}
      </>
    );
  };

  const appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#FBCB4A",
      colorBackground: "#161A17",
      focusBoxShadow: "none",
    },
  } as Appearance;

  if (state === PurchaseState.STRIPE_CHECKOUT) {
    return (
      <Elements
        options={{ clientSecret, appearance, loader: "auto" }}
        stripe={stripePromise}
      >
        <CheckoutForm
          onBack={() => setState(PurchaseState.SELECTION)}
          onComplete={() => setState(PurchaseState.SUCCESS)}
          creditsAmount={creditsAmount}
        />
      </Elements>
    );
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        className="p-6"
        title={title}
        icon={
          state === PurchaseState.SELECTION || state === PurchaseState.CRYPTO_CHECKOUT ? (
            <DepositIcon variant="solid" size="lg" />
          ) : (
            <CheckIcon size="lg" />
          )
        }
        onBack={() => {
          if (state === PurchaseState.SELECTION) {
            onBack?.();
          } else {
            setState(PurchaseState.SELECTION);
          }
        }}
      />
      <LayoutContent className="gap-6 px-6">
        <Balance types={[BalanceType.CREDITS]} />
        {state === PurchaseState.SELECTION && (
          <AmountSelection
            amount={creditsAmount}
            onChange={onAmountChanged}
            lockSelection={isLoading}
            enableCustom
          />
        )}
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
          <CardDescription className="flex flex-row items-start gap-3">
            <InfoIcon size="sm" className="text-foreground-200 flex-shrink-0" />
            <p className="text-foreground-200 font-normal text-xs">
              {getInfo(selectedWallet)}
            </p>
          </CardDescription>
        </Card>

        {state === PurchaseState.SUCCESS && isIframe() && (
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        )}
        {state === PurchaseState.SELECTION && (
          <>
            <Button
              className="flex-1"
              isLoading={isLoading}
              disabled={connecting}
              onClick={createPaymentIntent}
            >
              <CreditCardIcon
                size="sm"
                variant="solid"
                className="text-background-100 flex-shrink-0"
              />
              <span>Credit Card</span>
            </Button>
            <div className="flex flex-row gap-4 mt-2">
              {externalWallets.map((wallet) => {
                return (
                  <Button
                    key={wallet.type}
                    className="flex-1"
                    variant="secondary"
                    isLoading={
                      connecting && wallet.type === selectedWallet?.type
                    }
                    disabled={!wallet.available || connecting || isLoading}
                    onClick={() => onExternalConnect(wallet)}
                  >
                    {getWalletIcon(wallet, true)}
                  </Button>
                );
              })}
            </div>
          </>
        )}
        {state === PurchaseState.CRYPTO_CHECKOUT && (
          <Button
            className="flex-1 text-background-100 hover:brightness-90"
            variant="secondary"
            style={{
              backgroundColor: getWalletBgColor(selectedWallet!),
              border: "none",
            }}
            onClick={async () => {
              const res = await externalSignMessage(selectedWallet!.type, "Test signing message");
              if (!res.success) {
                setError(new Error(res.error));
              }
            }}
          >
            {getWalletIcon(selectedWallet)}
            Sign Message with {selectedWallet?.name}
          </Button>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}
