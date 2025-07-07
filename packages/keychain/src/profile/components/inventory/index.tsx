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

import { LayoutContent } from "@cartridge/ui";
import { Collections } from "./collection";
import { Tokens } from "./token";

export function Inventory() {
  return (
    <LayoutContent className="flex flex-col pt-6 pb-6 gap-6 overflow-y-auto">
      <Tokens />
      <Collections />
    </LayoutContent>
  );
}
