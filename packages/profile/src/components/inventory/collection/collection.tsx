import {
  Link,
  Outlet,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowIcon,
  Button,
  Card,
  CardHeader,
  CardTitle,
  cn,
  CopyAddress,
  ScrollArea,
} from "@cartridge/ui-next";
import {
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutFooter,
  LayoutHeader,
} from "@/components/layout";
import {
  Erc721__Token,
  useErc721BalancesQuery,
} from "@cartridge/utils/api/indexer";
import { useMemo } from "react";
import { useAccount } from "@/hooks/account";
import { useIndexerAPI } from "@cartridge/utils";
import { CollectionImage } from "./image";

type Collection = {
  address: string;
  name: string;
  imageUrl: string;
  assets: Asset[];
};

type Asset = {
  tokenId: string;
  name: string;
  imageUrl: string;
};

export function Collection() {
  const { address } = useAccount();
  const { tokenId } = useParams();
  const { indexerUrl, isReady } = useIndexerAPI();
  const { status, data } = useErc721BalancesQuery(
    { address },
    { enabled: isReady && !!address },
  );
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenIds = searchParams.getAll("tokenIds");

  const col = useMemo<Collection | undefined>(() => {
    if (!indexerUrl || !data?.tokenBalances) {
      return;
    }

    const assets: Asset[] = data.tokenBalances.edges.map((e) => {
      const a = e.node.tokenMetadata as Erc721__Token;
      return {
        address: a.contractAddress,
        name: a.metadataName,
        imageUrl: `${indexerUrl.replace("/graphql", "")}/static/${a.imagePath}`,
        tokenId: a.tokenId,
      };
    });

    return {
      address,
      name: assets[0].name,
      imageUrl: assets[0].imageUrl,
      assets,
    };
  }, [address, data, indexerUrl]);

  if (tokenId || location.pathname.includes("/send")) {
    return <Outlet />;
  }

  return (
    <LayoutContainer
      left={
        <Link to="..">
          <Button variant="icon" size="icon">
            <ArrowIcon variant="left" />
          </Button>
        </Link>
      }
    >
      {(() => {
        switch (status) {
          case "loading": {
            return <LayoutContentLoader />;
          }
          case "error": {
            return <LayoutContentError />;
          }
          default: {
            if (!col) {
              return <LayoutContentLoader />;
            }

            return (
              <>
                <LayoutHeader
                  title={col.name}
                  description={<CopyAddress address={col.address!} size="sm" />}
                  icon={<CollectionImage imageUrl={col.imageUrl} size="xs" />}
                />

                <LayoutContent className="pb-0">
                  <ScrollArea>
                    {/* <div
                      className="flex items-center gap-2 text-sm cursor-pointer self-start"
                      onClick={() => {
                        setSearchParams({
                          tokenIds: tokenIds.length
                            ? []
                            : col.assets.map((a) => a.tokenId),
                        });
                      }}
                    >
                      <CheckboxIcon
                        variant={
                          tokenIds.length ? "minus-line" : "unchecked-line"
                        }
                      />
                      <div className="text-muted-foreground font-semibold uppercase">
                        {tokenIds.length
                          ? `${tokenIds.length} selected`
                          : "Select all"}
                      </div>
                    </div> */}

                    <div className="grid grid-cols-2 gap-2 place-items-center pb-2">
                      {col.assets.map((a) => {
                        const isSelected = tokenIds.includes(a.tokenId);
                        return (
                          <Link
                            className="w-full aspect-square group"
                            to={`token/${a.tokenId}`}
                            state={location.state}
                            key={a.tokenId}
                          >
                            <Card
                              className={cn(
                                "w-full h-full border-2 border-solid transition overflow-hidden rounded-lg",
                                isSelected
                                  ? "border-foreground"
                                  : "border-transparent",
                              )}
                            >
                              <CardHeader className="flex flex-row items-center group-hover:opacity-70 p-0 justify-between">
                                <CardTitle className="truncate p-3">
                                  {a.name}
                                </CardTitle>

                                <div className="h-full place-content-center">
                                  <Button
                                    size="icon"
                                    variant="icon"
                                    className="h-full w-auto aspect-square bg-transparent hover:bg-transparent"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();

                                      setSearchParams({
                                        tokenIds: isSelected
                                          ? tokenIds.filter(
                                              (tokenId) =>
                                                tokenId !== a.tokenId,
                                            )
                                          : [...tokenIds, a.tokenId],
                                      });
                                    }}
                                  >
                                    {/* <CheckboxIcon
                                      variant={
                                        isSelected ? "line" : "unchecked-line"
                                      }
                                    /> */}
                                  </Button>
                                </div>
                              </CardHeader>
                              <CollectionImage
                                imageUrl={a.imageUrl}
                                size="xl"
                              />
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </LayoutContent>

                {!!tokenIds.length && (
                  <LayoutFooter>
                    <Link to={`send?${searchParams.toString()}`}>
                      <Button className="w-full">
                        Send ({tokenIds.length})
                      </Button>
                    </Link>
                  </LayoutFooter>
                )}
              </>
            );
          }
        }
      })()}
    </LayoutContainer>
  );
}
