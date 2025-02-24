export { Collectible, Collection, SendCollection } from "./collection";
export { Token } from "./token";
export { SendToken } from "./token/send";

import {
  CopyAddress,
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@cartridge/ui-next";
import { LayoutBottomNav } from "@/components/bottom-nav";
import { useAccount } from "#hooks/account";
import { Outlet, useParams } from "react-router-dom";
import { Collections } from "./collection";
import { Tokens } from "./token";

export function Inventory() {
  const { username, address } = useAccount();
  const { project, address: tokenContractAddress } = useParams<{
    project?: string;
    address?: string;
  }>();
  if (tokenContractAddress) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="xs" />}
      />

      <LayoutContent className="pb-4 gap-y-4">
        <Tokens />
        {project && <Collections />}
      </LayoutContent>

      {project && <LayoutBottomNav />}
    </LayoutContainer>
  );
}
