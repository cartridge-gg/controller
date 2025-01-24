import { Asset } from "@/hooks/collection";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CheckboxIcon,
  cn,
} from "@cartridge/ui-next";
import { Link, useLocation } from "react-router-dom";
import { CollectionImage } from "./image";

export const Collectibles = ({
  assets,
  tokenIds,
  selection,
  handleSelect,
}: {
  assets: Asset[];
  tokenIds: string[];
  selection: boolean;
  handleSelect: (tokenId: string) => void;
}) => {
  const location = useLocation();

  return (
    <div className="grid grid-cols-2 gap-4 place-items-center px-2.5">
      {assets.map((asset) => {
        const isSelected = tokenIds.includes(asset.tokenId);
        return (
          <Link
            className="w-full aspect-square group select-none"
            draggable={false}
            to={`token/${asset.tokenId}`}
            state={location.state}
            key={asset.tokenId}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              if (selection) {
                e.preventDefault();
                handleSelect(asset.tokenId);
              }
            }}
          >
            <Card
              className={cn(
                "w-full h-full border-2 border-solid transition overflow-hidden rounded-lg",
                isSelected ? "border-foreground" : "border-transparent",
              )}
            >
              <CardHeader className="flex flex-row items-center group-hover:opacity-70 p-0 justify-between">
                <CardTitle className="truncate p-3">{asset.name}</CardTitle>

                <div className="h-full place-content-center">
                  <Button
                    size="icon"
                    variant="icon"
                    className="h-full w-auto aspect-square bg-transparent hover:bg-transparent"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleSelect(asset.tokenId);
                    }}
                  >
                    <CheckboxIcon
                      variant={isSelected ? "line" : "unchecked-line"}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CollectionImage
                imageUrl={asset.imageUrl || undefined}
                size="xl"
              />
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
