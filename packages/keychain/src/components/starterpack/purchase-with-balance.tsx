import {
  Button,
  Card,
  CardContent,
  ControllerIcon,
  ExternalIcon,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Spinner,
  useUI,
} from "@cartridge/ui";
import { useState, useEffect } from "react";
import { Receiving } from "./receiving";
import { useStarterPack } from "@/hooks/starterpack";
import { Spending } from "./spending";
import { TotalCost } from "./total-cost";
const enum PurchaseState {
  REVIEW = 0,
  PENDING = 1,
  SUCCESS = 2,
}

export const PurchaseWithBalance = () => {
  const { items: starterPackItems, priceUsd } = useStarterPack("");
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
    <>
      <HeaderInner
        icon={
          purchaseState === PurchaseState.PENDING ? (
            <Spinner />
          ) : purchaseState === PurchaseState.REVIEW ? (
            <GiftIcon variant="solid" />
          ) : undefined
        }
        // title="Purchase Starter Pack"
        title={
          purchaseState === PurchaseState.SUCCESS
            ? "Success!"
            : "Purchase Starter Pack"
        }
        hideIcon
      />
      <LayoutContent>
        {purchaseState === PurchaseState.REVIEW ? (
          <Spending title="Spending" price={priceUsd} unit="USDC" />
        ) : purchaseState === PurchaseState.PENDING ? (
          <h1 className="text-xs font-semibold text-foreground-400 pb-4">
            Your starter pack is on the way!
          </h1>
        ) : (
          <h1 className="text-xs font-semibold text-foreground-400 pb-4">
            Purchase complete
          </h1>
        )}
        <Receiving
          title={
            purchaseState === PurchaseState.SUCCESS
              ? "You received"
              : "Receiving"
          }
          items={starterPackItems}
        />
      </LayoutContent>

      <LayoutFooter>
        {purchaseState === PurchaseState.PENDING ? (
          <Card>
            <CardContent className="flex items-center justify-between w-full text-sm bg-background-100 border border-background-200 p-2.5 text-foreground-400">
              <div className="flex items-center gap-2">
                <Spinner className="size-4" />
                <span>Confirming on starknet</span>
              </div>
              <a href="#" className="hover:text-foreground-200">
                <ExternalIcon className="size-4" />
              </a>
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
          <>
            <Card className="flex flex-row items-center justify-between gap-2">
              <TotalCost price={priceUsd} />
              <CardContent className="relative bg-background-200 w-9 aspect-square rounded">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-background-300 rounded-full w-6">
                  <img src="https://static.cartridge.gg/tokens/usdc.svg" />
                </div>
              </CardContent>
            </Card>
            <Button type="button" className="w-full" onClick={handlePurchase}>
              <ControllerIcon className="size-4" />
              <span>Purchase</span>
            </Button>
          </>
        )}
      </LayoutFooter>
    </>
  );
};
