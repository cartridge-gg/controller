import {
  ArrowFromLineIcon,
  ArrowToLineIcon,
  Button,
  Card,
  CardContent,
  CopyAddress,
  ExternalIcon,
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutHeader,
} from "@cartridge/ui-next";
import { useInfiniteTokenTransfersQuery } from "@cartridge/utils/api/indexer";
import { useAccount } from "#hooks/account";
import { Link } from "react-router-dom";
import { StarkscanUrl, useIndexerAPI } from "@cartridge/utils";
import { useConnection } from "#hooks/context";
import { constants } from "starknet";
import { LayoutBottomNav } from "#components/bottom-nav";

export function Activity() {
  const { address, username } = useAccount();
  const { chainId } = useConnection();
  const { isReady } = useIndexerAPI();
  const { status, data, hasNextPage, fetchNextPage } =
    useInfiniteTokenTransfersQuery(
      {
        address,
        first: 30,
      },
      {
        enabled: isReady && !!address,
        getNextPageParam: (lastPage) =>
          lastPage.tokenTransfers?.pageInfo.endCursor,
      },
    );

  return (
    <LayoutContainer>
      <LayoutHeader
        title={username}
        description={<CopyAddress address={address} size="xs" />}
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
                            const isSend = t.from === address;
                            return (
                              <Link
                                to={StarkscanUrl(
                                  chainId as constants.StarknetChainId,
                                ).transaction(t.transactionHash)}
                                target="_blank"
                                key={t.transactionHash}
                              >
                                <CardContent className="flex items-center justify-between text-foreground-200">
                                  <div className="flex items-center gap-1">
                                    {isSend ? (
                                      <ArrowFromLineIcon variant="up" />
                                    ) : (
                                      <ArrowToLineIcon variant="down" />
                                    )}
                                    <div>
                                      {isSend ? "Send" : "Receive"}{" "}
                                      {Number(t.tokenMetadata.amount) /
                                        10 **
                                          Number(
                                            t.tokenMetadata?.decimals,
                                          )}{" "}
                                      {t.tokenMetadata?.symbol}
                                    </div>
                                  </div>

                                  <ExternalIcon />
                                </CardContent>
                              </Link>
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
                </Card>

                {hasNextPage && (
                  <Button
                    className="w-full my-2"
                    onClick={() => fetchNextPage()}
                  >
                    See More
                  </Button>
                )}
              </LayoutContent>
            );
          }
        }
      })()}

      <LayoutBottomNav />
    </LayoutContainer>
  );
}
