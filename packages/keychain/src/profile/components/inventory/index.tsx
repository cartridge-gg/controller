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

import { Collections } from "./collection";
import { Tokens } from "./token";
import { RootLayout } from "#profile/components/layout/RootLayout";

export function Inventory() {
  return (
    <RootLayout>
      <Tokens />
      <Collections />
    </RootLayout>
  );
}
