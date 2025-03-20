import {
  ArgentColorIcon,
  Button,
  Card,
  CardContent,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  MetaMaskColorIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  Separator,
} from "@cartridge/ui-next";
import { StarterItem } from "./starter-item";
import { CreditCardIcon } from "@cartridge/ui-next";
import { TotalCost } from "./total-cost";
import { useState } from "react";
import { PurchaseWithBalance } from "./purchase-with-balance";
import { PurchaseWithoutBalance } from "./purchase-without-balance";
import { StarterPackProvider } from "../../context/starterpack";
import { useStarterPack } from "../../hooks/starterpack";

const enum PurchaseState {
  SHOW_OPTIONS,
  PURCHASE_WITH_BALANCE,
  PURCHASE_WITHOUT_BALANCE,
}

function StarterPackContent() {
  const { starterPackItems } = useStarterPack();
  const balance = 1;
  const [purchaseState, setPurchaseState] = useState<PurchaseState>(
    PurchaseState.SHOW_OPTIONS,
  );

  const handlePurchase = () => {
    if (balance > 0) {
      setPurchaseState(PurchaseState.PURCHASE_WITH_BALANCE);
    } else {
      setPurchaseState(PurchaseState.PURCHASE_WITHOUT_BALANCE);
    }
  };

  if (purchaseState === PurchaseState.PURCHASE_WITH_BALANCE) {
    return <PurchaseWithBalance />;
  }

  if (purchaseState === PurchaseState.PURCHASE_WITHOUT_BALANCE) {
    return <PurchaseWithoutBalance balance={balance} />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader title="Get Starter Pack" />
      <LayoutContent>
        <h1 className="text-xs font-semibold text-foreground-400">
          You receive
        </h1>

        <div className="flex flex-col gap-3">
          {starterPackItems.map((item, index) => (
            <StarterItem key={index} {...item} />
          ))}
        </div>
      </LayoutContent>

      <div className="m-1 mx-6">
        <Separator className="bg-spacer" />
      </div>

      <LayoutFooter>
        <Card className="flex flex-row items-center justify-between gap-2">
          <TotalCost
            price={starterPackItems.reduce((acc, item) => acc + item.price, 0)}
          />
          {balance <= 0 && (
            <CardContent className="relative flex items-center justify-center bg-background-200 w-11 aspect-square rounded">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-background-300 rounded-full">
                <img src="/ERC-20-Icon.svg" className="w-5" />
              </div>
            </CardContent>
          )}
        </Card>
        <Button className="w-full" onClick={handlePurchase}>
          {balance <= 0 && (
            <CreditCardIcon variant="solid" className="size-4" />
          )}
          <span>Purchase</span>
        </Button>
        <div className="w-full flex flex-row gap-3">
          <Button variant="secondary" className="w-full">
            <MetaMaskColorIcon className="size-4" />
          </Button>
          <Button variant="secondary" className="w-full">
            <ArgentColorIcon className="size-4" />
          </Button>
          <Button variant="secondary" className="w-full">
            <RabbyColorIcon className="size-4" />
          </Button>
          <Button variant="secondary" className="w-full">
            <PhantomColorIcon className="size-4" />
          </Button>
        </div>
      </LayoutFooter>
    </LayoutContainer>
  );
}

export function StarterPack() {
  return (
    <StarterPackProvider>
      <StarterPackContent />
    </StarterPackProvider>
  );
}
