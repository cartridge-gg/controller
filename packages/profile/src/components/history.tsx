import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";
import { CopyAddress } from "@cartridge/ui-next";

export function History() {
  const { username, address } = useConnection();
  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} />}
      />

      <LayoutContent>
        <div>History</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
