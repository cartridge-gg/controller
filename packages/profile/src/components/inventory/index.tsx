export { Asset } from "./asset";
export { Collection } from "./collection";
export { Send } from "./send";
export { Token } from "./token";

import { CopyAddress } from "@cartridge/ui-next";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
// import { Collections } from "./collections";
import { Tokens } from "./tokens";
import { useAccount } from "@/hooks/account";
// import { Navigation } from "@/components/navigation";

export function Inventory() {
  const { username, address } = useAccount();

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
