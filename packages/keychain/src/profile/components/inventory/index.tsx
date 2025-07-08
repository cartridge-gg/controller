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

export function Inventory() {
  return (
    <LayoutContainer>
      <NavigationHeader variant="hidden" hasBottomNav />

      <LayoutContent className="flex flex-col pt-6 pb-6 gap-6 overflow-y-auto">
        <Tokens />
        <Collections />
      </LayoutContent>

      <LayoutBottomNav />
    </LayoutContainer>
  );
}
