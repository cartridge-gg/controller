import {
  Button,
  Card,
  CardContent,
  CheckIcon,
  CopyAddress,
} from "@cartridge/ui-next";
import { useInfiniteTokenTransfersQuery } from "@cartridge/utils/api/indexer";
import {
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutHeader,
} from "@/components/layout";
import { Navigation } from "@/components/navigation";
import { useAccount } from "@/hooks/account";

export function Activity() {
  const { address, username } = useAccount();
  const { status, data, hasNextPage, fetchNextPage } =
    useInfiniteTokenTransfersQuery(
      {
        address,
      },
      {
        getNextPageParam: (lastPage) =>
          lastPage.tokenTransfers?.pageInfo.endCursor,
      },
    );

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="sm" />}
        right={<Navigation />}
      />

      {(() => {
        switch (status) {
          case "loading": {
            return <LayoutContentLoader />;
          }
          case "error": {
            return <LayoutContentError />;
          }
          case "success": {
            return (
              <LayoutContent>
                <Card>
                  {data.pages.map((p) =>
                    p.tokenTransfers?.edges.length ? (
                      p.tokenTransfers.edges.map(({ node: t }) => {
                        switch (t.tokenMetadata.__typename) {
                          case "ERC20__Token": {
                            return (
                              <CardContent className="flex items-center gap-1">
                                <CheckIcon size="sm" />
                                <div>
                                  Send{" "}
                                  {Number(t.tokenMetadata.amount) /
                                    10 **
                                      Number(t.tokenMetadata?.decimals)}{" "}
                                  {t.tokenMetadata?.symbol}
                                </div>
                              </CardContent>
                            );
                          }
                          case "ERC721__Token":
                            return null;
                        }
                      })
                    ) : (
                      <CardContent>No data</CardContent>
                    ),
                  )}

                  {hasNextPage && (
                    <Button onClick={() => fetchNextPage()}>More</Button>
                  )}
                </Card>
              </LayoutContent>
            );
          }
        }
      })()}
    </LayoutContainer>
  );
}
