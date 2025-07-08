export {
  Collection,
  CollectionAsset,
  Collectible,
  CollectibleAsset,
  CollectionListing,
  SendCollection,
  SendCollectible,
} from "./collection";
export { Token } from "./token";
export { SendToken } from "./token/send";

import { LayoutContainer, LayoutContent } from "@cartridge/ui";
import { LayoutBottomNav } from "#profile/components/bottom-nav";
import { Collections } from "./collection";
import { Tokens } from "./token";
import { NavigationHeader } from "@/components";
import { Link } from "react-router-dom";
import { InventoryCard } from "@/components/inventory-card";

export function Inventory() {
  return (
    <LayoutContainer>
      <NavigationHeader variant="hidden" hasBottomNav />
      <LayoutContent className="p-6 pt-0 select-none overflow-hidden">
        <div className="grid grid-cols-2 gap-4">
          <Link to="?tab=tokens">
            <InventoryCard variant="token" />
          </Link>
          <Link to="?tab=collectibles">
            <InventoryCard variant="collectible" />
          </Link>
        </div>
      </LayoutContent>
      <LayoutBottomNav />
    </LayoutContainer>
  );
}
