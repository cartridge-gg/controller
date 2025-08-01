import {
  StarterItemData,
  StarterItemType,
  useStarterPack,
} from "@/hooks/starterpack";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Skeleton,
} from "@cartridge/ui";
import { MintAllowance } from "@cartridge/ui/utils/api/cartridge";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { useParams } from "react-router-dom";
import { useNavigation, usePurchaseContext } from "@/context";
import { useEffect } from "react";
import { PurchaseItem, PurchaseItemType } from "@/context/purchase";

export function PurchaseStarterpack() {
  const { starterpackId } = useParams();
  const { name, items, supply, mintAllowance, priceUsd, isLoading } =
    useStarterPack(starterpackId);
  const { setStarterpackId, setPurchaseItems, setUsdAmount } =
    usePurchaseContext();

  if (!starterpackId) {
    throw new Error("Starterpack ID is required");
  }

  useEffect(() => {
    if (!isLoading && starterpackId) {
      setStarterpackId(starterpackId);
      setUsdAmount(priceUsd);
      const purchaseItems = items.map((item) => {
        return {
          title: item.title,
          icon: item.image,
          value: item.value,
          type:
            item.type === StarterItemType.NFT
              ? PurchaseItemType.NFT
              : PurchaseItemType.CREDIT,
        } as PurchaseItem;
      });
      setPurchaseItems(purchaseItems);
    }
  }, [starterpackId, isLoading]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <StarterPackInner
      name={name}
      supply={supply}
      mintAllowance={mintAllowance}
      starterpackItems={items}
    />
  );
}

export function StarterPackInner({
  name,
  supply,
  mintAllowance,
  starterpackItems = [],
}: {
  name: string;
  supply?: number;
  mintAllowance?: MintAllowance;
  starterpackItems?: StarterItemData[];
}) {
  const { navigate } = useNavigation();
  return (
    <>
      <HeaderInner
        title={name}
        right={supply ? <Supply amount={supply} /> : undefined}
        hideIcon
      />
      <LayoutContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between">
            <h1 className="text-xs font-semibold text-foreground-400">
              You receive
            </h1>
            {mintAllowance && (
              <h1 className="text-xs font-semibold text-foreground-400">
                Mints Remaining: {mintAllowance.limit - mintAllowance.count} /{" "}
                {mintAllowance.limit}
              </h1>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {starterpackItems
              .filter((item) => item.type === StarterItemType.NFT)
              .map((item, index) => (
                <StarterItem key={index} {...item} />
              ))}
            {starterpackItems
              .filter((item) => item.type === StarterItemType.CREDIT)
              .map((item, index) => (
                <StarterItem key={index} {...item} />
              ))}
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        <Button onClick={() => navigate("/purchase/method")}>Purchase</Button>
      </LayoutFooter>
    </>
  );
}

const LoadingState = () => {
  return (
    <LayoutContent>
      <Skeleton className="min-h-10 w-full rounded" />
      <Skeleton className="min-h-10 w-full rounded" />
      <Skeleton className="min-h-[180px] w-full rounded" />
      <Skeleton className="min-h-[180px] w-full rounded" />
    </LayoutContent>
  );
};
