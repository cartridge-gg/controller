import {
  Drawer,
  DrawerContent,
  DepositIcon,
  Button,
  TokenCard,
} from "@cartridge/controller-ui";
import { PaymentMethodSelection } from "@/components/purchase/checkout/onchain/wallet-drawer";
import { WalletSelector } from "@/components/purchase/checkout/onchain/selector";
import { CostBreakdown } from "@/components/purchase/review/cost";
import { useTokens } from "@/hooks/token";
import { useConnection } from "@/hooks/connection";
import { USDC_ADDRESSES } from "@/utils/ekubo";
import type { TokenOption } from "@/context";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: PaymentMethodSelection | null;
  amount: number;
  onChangeMethod: () => void;
  onChangeAmount: () => void;
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  onChangeMethod,
  onChangeAmount,
}: CheckoutDrawerProps) {
  const { credits: token } = useTokens();
  const { controller } = useConnection();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // $1 of credits is always $1 of USDC, so while USDC is the only rail we can
  // build the quote locally (1:1) — no backend quote needed. Future rails
  // (other tokens, Coinflow, Apple Pay) will swap this for a real quote and an
  // expanded token list; CostBreakdown stays the same.
  const usdcToken = useMemo<TokenOption>(
    () => ({
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: controller
        ? (USDC_ADDRESSES[controller.chainId()] ?? "usdc")
        : "usdc",
      icon: "https://static.cartridge.gg/tokens/usdc.svg",
      contract: {} as TokenOption["contract"],
    }),
    [controller],
  );

  // initialize
  useEffect(() => {
    setIsPurchasing(false);
  }, [isOpen]);

  const handlePurchase = useCallback(
    async () => {
      setIsPurchasing(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } finally {
        setIsPurchasing(false);
        onClose()
      }
    },
    [paymentMethod],
  );

  const canPurchase = !!amount && !!paymentMethod;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} className="gap-4">
      <DrawerContent title="Buy Credits" icon={<DepositIcon variant="solid" />}>

        <TokenCard
          image={token.metadata.image}
          title={token.metadata.name}
          value={`$${amount.toFixed(2)}`}
          amount={"1 Credit = 1.00 USD ($1.00)"}
          onClick={onChangeAmount}
        />

        <WalletSelector method={paymentMethod} onClick={onChangeMethod} />

        <CostBreakdown
          tokens={[usdcToken]}
          selectedToken={usdcToken}
          onSelectToken={() => {}}
          tokenSelectDisabled
          value={
            <span className="text-foreground-100">{amount.toFixed(2)}</span>
          }
        />

        <Button
          disabled={!canPurchase}
          isLoading={isPurchasing}
          onClick={() => {
            handlePurchase();
          }}
        >
          BUY CREDITS
        </Button>

      </DrawerContent>
    </Drawer>
  );
}
