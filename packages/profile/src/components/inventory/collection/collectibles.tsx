import { Asset } from "#hooks/collection";
import { CollectibleCard } from "@cartridge/ui-next";
import { Link, useLocation } from "react-router-dom";
import placeholder from "/public/placeholder.svg";

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
    <div className="grid grid-cols-2 gap-4 place-items-center">
      {assets.map((asset) => {
        const isSelected = tokenIds.includes(asset.tokenId);
        return (
          <Link
            className="w-full select-none"
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
            <CollectibleCard
              title={
                asset.name.includes(
                  `${parseInt(BigInt(asset.tokenId).toString())}`,
                )
                  ? asset.name
                  : `${asset.name} #${parseInt(BigInt(asset.tokenId).toString())}`
              }
              image={asset.imageUrl || placeholder}
              selected={isSelected}
              onSelect={() => handleSelect(asset.tokenId)}
              className="rounded overflow-hidden"
            />
          </Link>
        );
      })}
    </div>
  );
};
