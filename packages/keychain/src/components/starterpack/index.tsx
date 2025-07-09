import { useLocalSearchParams } from "expo-router";
import {
  MintAllowance,
  StarterItemData,
  StarterItemType,
  useStarterPack,
} from "../../hooks/starterpack";
import { Purchase } from "../purchase";
import { StarterItem } from "./starter-item";
import { PurchaseType } from "@/hooks/payments/crypto";

export function StarterPack({ starterpackId }: { starterpackId: string }) {
  const { name, description, items, supply, priceUsd, mintAllowance } =
    useStarterPack(starterpackId);

  return (
    <Purchase
      type={PurchaseType.STARTERPACK}
      starterpackDetails={{
        id: starterpackId,
        name,
        description,
        priceUsd,
        supply,
        mintAllowance,
        starterPackItems: items,
      }}
    />
  );
}

export function StarterPackWrapper() {
  const { starterpackId } = useLocalSearchParams<{ starterpackId: string }>();

  if (!starterpackId) {
    return <div>No starterpack ID</div>;
  }

  return <StarterPack starterpackId={starterpackId} />;
}

export function StarterPackContent({
  mintAllowance,
  starterpackItems = [],
}: {
  mintAllowance?: MintAllowance;
  starterpackItems?: StarterItemData[];
}) {
  return (
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
  );
}
