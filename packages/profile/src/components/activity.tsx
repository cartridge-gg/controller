import {
  Button,
  Card,
  CardContent,
  CheckIcon,
  CopyAddress,
  ExternalIcon,
  ScrollArea,
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
import { Link } from "react-router-dom";
import { StarkscanUrl } from "@cartridge/utils";
import { useConnection } from "@/hooks/context";
import { constants } from "starknet";

export function Activity() {
  const { address, username } = useAccount();
  const { chainId } = useConnection();
  const { status, data, hasNextPage, fetchNextPage } =
    useInfiniteTokenTransfersQuery(
      {
        address,
        first: 30,
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
                <ScrollArea>
                  <Card>
                    {data.pages.map((p) =>
                      p.tokenTransfers?.edges.length ? (
                        p.tokenTransfers.edges.map(({ node: t }) => {
                          switch (t.tokenMetadata.__typename) {
                            case "ERC20__Token": {
                              return (
                                <Link
                                  to={StarkscanUrl(
                                    chainId as constants.StarknetChainId,
                                  ).transaction(t.transactionHash)}
                                  target="_blank"
                                  key={t.transactionHash}
                                >
                                  <CardContent className="flex items-center justify-between text-accent-foreground">
                                    <div className="flex items-center gap-1">
                                      <CheckIcon size="sm" />
                                      <div>
                                        Send{" "}
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
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchNextPage()}
                    >
                      See More
                    </Button>
                  )}
                </ScrollArea>
              </LayoutContent>
            );
          }
        }
      })()}
    </LayoutContainer>
  );
}
