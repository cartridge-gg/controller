import {
  Card,
  CardHeader,
  CardTitle,
  CollectibleAssetCard,
  CollectiblePill,
} from "@cartridge/ui";
import { Asset } from "#profile/hooks/collection";

import placeholder from "/public/placeholder.svg";

export function Sending({
  assets,
  description,
}: {
  assets: Asset[];
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 justify-between">
          <CardTitle className="select-none">Sending</CardTitle>
          <CollectiblePill
            className="bg-background-300 text-foreground-300 tracking-normal text-xs font-medium"
            label={`${assets.length} total`}
          />
        </div>
      </CardHeader>

      {assets.map((asset) => (
        <CollectibleAssetCard
          key={asset.tokenId}
          image={asset.imageUrl || placeholder}
          title={asset.name}
          description={description}
        />
      ))}
    </Card>
  );
}
