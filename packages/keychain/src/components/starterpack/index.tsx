import { useParams } from "react-router-dom";
import {
  StarterItemData,
  StarterItemType,
  useStarterPack,
} from "../../hooks/starterpack";
import { Purchase } from "../purchase";
import { StarterItem } from "./starter-item";
import { PurchaseType } from "@/hooks/payments/crypto";

export function StarterPack({ starterpackId }: { starterpackId: string }) {
  const { items, price } = useStarterPack(starterpackId);

  return (
    <Purchase
      type={PurchaseType.STARTERPACK}
      starterpackDetails={{
        id: starterpackId,
        price,
        starterPackItems: items,
      }}
    />
  );
}

export function StarterPackWrapper() {
  const { starterpackId } = useParams();

  if (!starterpackId) {
    return <div>No starterpack ID</div>;
  }

  return <StarterPack starterpackId={starterpackId} />;
}

export function StarterPackContent({
  starterpackItems = [],
}: {
  starterpackItems?: StarterItemData[];
}) {
  return (
    <>
      <h1 className="text-xs font-semibold text-foreground-400">You receive</h1>
      <div className="flex flex-col gap-3">
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
    </>
  );
}
