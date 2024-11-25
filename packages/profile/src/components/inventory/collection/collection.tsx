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
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  CopyAddress,
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
  const { status, data } = useErc721BalancesQuery({ address });
  const { indexerUrl } = useIndexerAPI();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenIds = searchParams.getAll("tokenIds");

  const col = useMemo<Collection>(() => {
    const assets: Asset[] =
      data?.tokenBalances?.edges.map((e) => {
        const a = e.node.tokenMetadata as Erc721__Token;
        return {
          address: a.contractAddress,
          name: a.metadataName,
          imageUrl: `${indexerUrl.replace("/graphql", "")}/static/${
            a.imagePath
          }`,
          tokenId: a.tokenId,
        };
      }) ?? [];

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
            return (
              <>
                <LayoutHeader
                  title={col.name}
                  description={<CopyAddress address={col.address!} size="sm" />}
                  icon={col.imageUrl ?? "/public/placeholder.svg"}
                />

                <LayoutContent className="pb-4">
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

                  <div className="grid grid-cols-2 gap-2 place-items-center">
                    {col.assets.map((a) => {
                      const isSelected = tokenIds.includes(a.tokenId);
                      return (
                        <Link
                          className="w-full aspect-square group"
                          to={a.tokenId}
                          state={location.state}
                          key={a.tokenId}
                        >
                          <Card
                            className={cn(
                              "w-full h-full border-2 border-solid transition overflow-scroll",
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
                                            (tokenId) => tokenId !== a.tokenId,
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
                            <CardContent
                              className="bg-cover bg-center flex py-4 h-full place-content-center overflow-hidden"
                              style={{
                                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${a.imageUrl})`,
                              }}
                            >
                              <img
                                className="object-contain transition group-hover:scale-110"
                                src={a.imageUrl}
                              />
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
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
