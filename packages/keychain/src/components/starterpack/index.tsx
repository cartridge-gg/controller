import {
  ArgentColorIcon,
  Button,
  LayoutContainer,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  MetaMaskColorIcon,
  PhantomColorIcon,
  RabbyColorIcon,
} from "@cartridge/ui-next";
import { StarterItem } from "./starter-item";
import { CreditCardIcon } from "@cartridge/ui-next";
import { useState } from "react";
import { PurchaseWithBalance } from "./purchase-with-balance";
import { PurchaseWithoutBalance } from "./purchase-without-balance";
import {
  StarterItemData,
  StarterItemType,
  StarterPackProvider,
} from "../../context/starterpack";
import { useStarterPack } from "../../hooks/starterpack";

const enum PurchaseState {
  SHOW_OPTIONS,
  PURCHASE_WITH_BALANCE,
  PURCHASE_WITHOUT_BALANCE,
}

function StarterPackContent() {
  const { starterPackItems } = useStarterPack();
  const [purchaseState, setPurchaseState] = useState<PurchaseState>(
    PurchaseState.SHOW_OPTIONS,
  );

  const { balance } = useStarterPack();

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
    return <PurchaseWithoutBalance />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader title="Eternum Starter Pack" />
      <LayoutContent>
        <h1 className="text-xs font-semibold text-foreground-400">
          You receive
        </h1>

        <div className="flex flex-col gap-3">
          {starterPackItems
            .filter((item) => item.type === StarterItemType.NFT)
            .map((item, index) => (
              <StarterItem key={index} {...item} />
            ))}
          {starterPackItems
            .filter((item) => item.type === StarterItemType.CREDIT)
            .map((item, index) => (
              <StarterItem key={index} {...item} />
            ))}
        </div>
      </LayoutContent>

      <LayoutFooter>
        {balance <= 0 ? (
          <>
            <Button className="w-full" onClick={handlePurchase}>
              <CreditCardIcon variant="solid" className="size-4" />
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
          </>
        ) : (
          <Button className="w-full" onClick={handlePurchase}>
            <span>Continue</span>
          </Button>
        )}
      </LayoutFooter>
    </LayoutContainer>
  );
}

export function StarterPack({ starterpackId }: { starterpackId: string }) {
  const starterPackItems: StarterItemData[] = [
    {
      title: "Village",
      collectionName: "Eternum Village",
      description:
        "Villages are the basic building block of eternum, they allow you to produce troops and resources.",
      price: 5,
      image: "https://r2.quddus.my/Frame%203231.png",
      type: StarterItemType.NFT,
    },
    {
      title: "20 Credits",
      description: "Credits cover service fee(s) in Eternum.",
      price: 0,
      image: "/ERC-20-Icon.svg",
      type: StarterItemType.CREDIT,
      value: 50,
    },
  ];

  const balance = 10;
  const price = 5;

  return (
    <StarterPackProvider
      balance={balance}
      starterPackItems={starterPackItems}
      price={price}
    >
      <StarterPackContent />
    </StarterPackProvider>
  );
}
