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
import {
  MintAllowance,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { useParams } from "react-router-dom";
import { useNavigation, usePurchaseContext } from "@/context";
import { useEffect } from "react";
import { PurchaseItem, PurchaseItemType } from "@/context/purchase";
import { ErrorAlert } from "@/components/ErrorAlert";
import { CollectionItem, Collections } from "./collections";
import { ExternalPlatform } from "@cartridge/controller";

// Placeholder collections
export const dummyCollections: CollectionItem[] = [
  {
    name: "Realms",
    image: "https://placehold.co/80x80",
    platforms: ["starknet", "ethereum"] as ExternalPlatform[],
  },
  {
    name: "Dopewars",
    image: "https://placehold.co/80x80",
    platforms: ["optimism"] as ExternalPlatform[],
  },
  {
    name: "Loot",
    image: "https://placehold.co/80x80",
    platforms: ["ethereum"] as ExternalPlatform[],
  },
  {
    name: "Blob Arena",
    image: "https://placehold.co/80x80",
    platforms: ["starknet"] as ExternalPlatform[],
  },
  {
    name: "Something",
    image: "https://placehold.co/80x80",
    platforms: ["arbitrum"] as ExternalPlatform[],
  },
];

export function PurchaseStarterpack() {
  const { starterpackId } = useParams();
  const {
    name,
    items,
    supply,
    mintAllowance,
    priceUsd,
    acquisitionType,
    isLoading,
    error,
  } = useStarterPack(starterpackId);
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
  }, [
    starterpackId,
    isLoading,
    items,
    priceUsd,
    setStarterpackId,
    setUsdAmount,
    setPurchaseItems,
  ]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <StarterPackInner
      name={name}
      supply={supply}
      mintAllowance={mintAllowance}
      acquisitionType={acquisitionType}
      starterpackItems={items}
      collections={dummyCollections}
      error={error}
    />
  );
}

export function StarterPackInner({
  name,
  supply,
  mintAllowance,
  acquisitionType,
  starterpackItems = [],
  collections = [],
  error,
}: {
  name: string;
  supply?: number;
  mintAllowance?: MintAllowance;
  acquisitionType: StarterpackAcquisitionType;
  starterpackItems?: StarterItemData[];
  collections?: CollectionItem[];
  error?: Error | null;
}) {
  const { navigate } = useNavigation();

  const onProceed = () => {
    switch (acquisitionType) {
      case StarterpackAcquisitionType.Paid:
        navigate("/purchase/method");
        break;
      case StarterpackAcquisitionType.Claimed:
        navigate("/purchase/network");
        break;
      default:
        throw new Error(`Invalid acquisition type: ${acquisitionType}`);
    }
  };
  return (
    <>
      <HeaderInner
        title={name}
        right={supply ? <Supply amount={supply} /> : undefined}
        hideIcon
      />
      <LayoutContent>
        <div className="flex flex-col gap-3">
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
          {acquisitionType === StarterpackAcquisitionType.Claimed && (
            <Collections collections={collections} />
          )}
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}
        <Button onClick={onProceed} disabled={!!error}>
          {acquisitionType === StarterpackAcquisitionType.Paid
            ? "Purchase"
            : "Check Eligibility"}
        </Button>
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
