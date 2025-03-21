import {
  Button,
  Card,
  CardContent,
  GiftIcon,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  Separator,
  Spinner,
  useUI,
} from "@cartridge/ui-next";
import { LayoutContainer } from "@cartridge/ui-next";
import React, { useState, useEffect } from "react";
import { Balance, BalanceType } from "../funding/Balance";
import { Receiving } from "./receiving";
import { useStarterPack } from "@/hooks/starterpack";

const enum PurchaseState {
  REVIEW = 0,
  PENDING = 1,
  SUCCESS = 2,
}

export const PurchaseWithBalance = React.memo(() => {
  const { starterPackItems } = useStarterPack();
  const { closeModal } = useUI();
  const [purchaseState, setPurchaseState] = useState<PurchaseState>(
    PurchaseState.REVIEW,
  );

  // Simulate a purchase
  useEffect(() => {
    if (purchaseState === PurchaseState.PENDING) {
      const timer = setTimeout(() => {
        setPurchaseState(PurchaseState.SUCCESS);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [purchaseState]);

  const handlePurchase = () => {
    setPurchaseState(PurchaseState.PENDING);
  };

  return (
    <LayoutContainer>
      <LayoutHeader
        icon={
          purchaseState === PurchaseState.PENDING ? (
            <Spinner />
          ) : purchaseState === PurchaseState.REVIEW ? (
            <GiftIcon variant="solid" />
          ) : undefined
        }
        title="Purchase Starter Pack"
      />
      <LayoutContent>
        {purchaseState === PurchaseState.REVIEW ? (
          <Balance types={[BalanceType.CREDITS]} title="Spending" />
        ) : purchaseState === PurchaseState.PENDING ? (
          <h1 className="text-xs font-semibold text-foreground-400 pb-4">
            Your starter pack is on the way!
          </h1>
        ) : (
          <h1 className="text-xs font-semibold text-foreground-400 pb-4">
            Purchase complete
          </h1>
        )}
        <Receiving title="Receiving" items={starterPackItems} />
      </LayoutContent>

      <div className="m-1 mx-6">
        <Separator className="bg-spacer" />
      </div>

      <LayoutFooter>
        {purchaseState === PurchaseState.PENDING ? (
          <Card>
            <CardContent className="flex items-center justify-center w-full text-sm bg-background-100 border border-background-200 p-2.5 text-foreground-400">
              <Spinner className="mr-2" />
              <span>Confirming on starknet</span>
            </CardContent>
          </Card>
        ) : purchaseState === PurchaseState.SUCCESS ? (
          <Button
            variant="secondary"
            type="button"
            className="w-full"
            onClick={closeModal}
          >
            <span>Close</span>
          </Button>
        ) : (
          <Button type="button" className="w-full" onClick={handlePurchase}>
            <span>Purchase</span>
          </Button>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
});
