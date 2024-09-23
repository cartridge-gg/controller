import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "./provider/hooks";
import { formatAddress } from "@cartridge/utils";

export function History() {
  const { username, address } = useConnection();
  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={formatAddress(address, { first: 15, last: 15 })}
      />

      <LayoutContent>
        <div>History</div>
      </LayoutContent>
    </LayoutContainer>
  );
}
