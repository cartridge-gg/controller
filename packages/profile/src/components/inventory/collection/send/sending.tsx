import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from "@cartridge/ui-next";
import { Asset } from "#hooks/collection";
import { CollectionImage } from "../image";

export function Sending({ assets }: { assets: Asset[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="select-none">Sending</CardTitle>
      </CardHeader>

      {assets.map((asset) => (
        <Item
          key={asset.tokenId}
          name={asset.name || ""}
          tokenId={asset.tokenId}
          imageUrl={asset.imageUrl || undefined}
        />
      ))}
    </Card>
  );
}

function Item({
  name,
  tokenId,
  imageUrl = "/public/placeholder.svg",
}: {
  name: string;
  tokenId: string;
  imageUrl?: string;
}) {
  return (
    <CardContent
      className={cn(
        "bg-background flex items-center p-0 h-11 gap-px hover:opacity-80",
      )}
    >
      <div className="bg-background-200 flex w-11 aspect-square items-center justify-center">
        <div className="flex items-center justify-center overflow-hidden h-7 w-7 bg-background-300 p-0.5">
          <CollectionImage imageUrl={imageUrl} size="xs" />
        </div>
      </div>

      <div className="bg-background-200 flex flex-1 gap-x-1.5 items-center justify-between p-3 text-medium">
        <p>{`${name} #${parseInt(tokenId, 16)}`}</p>
      </div>
    </CardContent>
  );
}
