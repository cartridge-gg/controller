import { Card, CardContent, CheckIcon, CopyAddress } from "@cartridge/ui-next";
import { useTokenTransfersQuery } from "@cartridge/utils/api/indexer";
import {
  LayoutContainer,
  LayoutContent,
  LayoutHeader,
} from "@/components/layout";
import { Navigation } from "@/components/navigation";
import { useAccount } from "@/hooks/account";

export function Activity() {
  const { address, username } = useAccount();
  const { data } = useTokenTransfersQuery({ address });

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
      />

      <LayoutContent>
        {data?.tokenTransfers?.edges ? (
          <Card>
            {data.tokenTransfers.edges.map(({ node: t }) => {
              switch (t.tokenMetadata.__typename) {
                case "ERC20__Token": {
                  return (
                    <CardContent className="flex items-center gap-1">
                      <CheckIcon size="sm" />
                      <div>
                        Send{" "}
                        {Number(t.tokenMetadata.amount) /
                          10 ** Number(t.tokenMetadata?.decimals)}{" "}
                        {t.tokenMetadata?.symbol}
                      </div>
                    </CardContent>
                  );
                }
                case "ERC721__Token":
                  return null;
              }
            })}
          </Card>
        ) : (
          <Card>
            <CardContent>No data</CardContent>
          </Card>
        )}
      </LayoutContent>
    </LayoutContainer>
  );
}
