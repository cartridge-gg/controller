import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useAccount } from "@/hooks/context";
import { CopyAddress } from "@cartridge/ui-next";
import { Navigation } from "./navigation";

export function Quest() {
  const { username, address } = useAccount();

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
      />

      <LayoutContent>
        <div>Quest</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
