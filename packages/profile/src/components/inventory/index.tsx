export { Asset, Collection, SendCollection } from "./collection";
export { Token, SendToken } from "./token";

import { CopyAddress } from "@cartridge/ui-next";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { Navigation } from "../navigation";
import { Tokens } from "./token";
import { useAccount } from "@/hooks/account";
import { Outlet, useParams } from "react-router-dom";
import { Collections } from "./collection";

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
        description={<CopyAddress address={address} size="sm" />}
        right={project ? <Navigation /> : undefined}
      />

      <LayoutContent className="pb-4">
        <Tokens />
        {project && <Collections />}
      </LayoutContent>
    </LayoutContainer>
  );
}
