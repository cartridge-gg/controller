export { Asset } from "./asset";
export { Collection } from "./collection";
export { Send } from "./send";

import { CopyAddress } from "@cartridge/ui-next";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "@/hooks/context";
// import { Collections } from "./collections";
import { Tokens } from "./tokens";
// import { Navigation } from "@/components/navigation";

export function Inventory() {
  const { username, address } = useConnection();

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        // right={<Navigation />}
      />

      <LayoutContent className="pb-4">
        <Tokens />
        {/* <Collections /> */}
      </LayoutContent>
    </LayoutContainer>
  );
}
