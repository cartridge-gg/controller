import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";
import { CopyAddress } from "@cartridge/ui-next";

export function Quest() {
  const { username, address } = useConnection();

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} />}
      />

      <LayoutContent>
        <div>Quest</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
