import { CopyAddress } from "@cartridge/ui-next";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";
import { formatAddress } from "@cartridge/utils";

export function Inventory() {
  const { username, address } = useConnection();

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} />}
      />

      <LayoutContent>
        <div>Inventory</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
