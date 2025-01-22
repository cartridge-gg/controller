export { Collectible, Collection, SendCollection } from "./collection";
export { Token } from "./token";
export { SendToken } from "./token/send";

import {
  CopyAddress,
  ScrollArea,
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@cartridge/ui-next";
import { Navigation } from "../navigation";
import { Tokens } from "./token";
import { useAccount } from "@/hooks/account";
import { Outlet, useParams } from "react-router-dom";
import { Collections } from "./collection";
import { useConnection } from "@/hooks/context";

export function Inventory() {
  const { username, address } = useAccount();
  const { project, address: tokenContractAddress } = useParams<{
    project?: string;
    address?: string;
  }>();
  const { chainId, openSettings, closeModal } = useConnection();

  if (tokenContractAddress) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={project ? <Navigation /> : undefined}
        chainId={chainId}
        openSettings={openSettings}
        onClose={closeModal}
      />

      <LayoutContent className="pb-4">
        <ScrollArea>
          <div className="flex flex-col gap-y-4">
            <Tokens />
            {project && <Collections />}
          </div>
        </ScrollArea>
      </LayoutContent>
    </LayoutContainer>
  );
}
