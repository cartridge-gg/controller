import { CopyAddress } from "@cartridge/ui-next";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { useConnection } from "@/components/provider/hooks";
import { Navigation } from "@/components/navigation";
import { useTransferQuery } from "@cartridge/utils";

export function History() {
  const { username, address, indexerUrl } = useConnection();
  const { data } = useTransferQuery(
    {
      endpoint: indexerUrl,
    },
    {
      // [TODO]: Remove mocked address
      address: "0x04645f67e3e195420b2b4e63742153623e50c143ed8b89c91e3fb908fe87b168",
      limit: 100,
    },
  );
  console.log(data, indexerUrl, address)

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
      />

      <LayoutContent>
        <div>History</div>
        {(data?.ercTransfer ?? []).map((t) => (
          <div>
            <div>{t.amount}</div>
          </div>
        ))}
      </LayoutContent>
    </LayoutContainer>
  );
}
