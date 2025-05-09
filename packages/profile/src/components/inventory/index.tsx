export {
  Collection,
  CollectionAsset,
  Collectible,
  CollectibleAsset,
  SendCollection,
  SendCollectible,
} from "./collection";
export { Token } from "./token";
export { SendToken } from "./token/send";

import { LayoutContainer, LayoutContent, LayoutHeader } from "@cartridge/ui";
import { LayoutBottomNav } from "#components/bottom-nav";
import { Outlet, useParams } from "react-router-dom";
import { Collections } from "./collection";
import { Tokens } from "./token";

export function Inventory() {
  const { project, address: tokenContractAddress } = useParams<{
    project?: string;
    address?: string;
  }>();
  if (tokenContractAddress) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader variant="hidden" onBack={undefined} />

      <LayoutContent className="flex flex-col pt-6 pb-6 gap-6 overflow-y-auto">
        <Tokens />
        {project && <Collections />}
      </LayoutContent>

      {project && <LayoutBottomNav />}
    </LayoutContainer>
  );
}
