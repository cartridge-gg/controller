import { Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutHeader,
} from "@/components/layout";
import {
  ArrowIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyText,
  ExternalIcon,
} from "@cartridge/ui-next";
import { addAddressPadding, constants } from "starknet";
import {
  formatAddress,
  isPublicChain,
  StarkscanUrl,
  useIndexerAPI,
} from "@cartridge/utils";
import { useConnection } from "@/hooks/context";
import {
  Erc721__Token,
  useErc721BalancesQuery,
} from "@cartridge/utils/api/indexer";
import { useAccount } from "@/hooks/account";
import { useMemo } from "react";

type Collection = {
  address: string;
  name: string;
  type: string;
};

type Asset = {
  tokenId: string;
  name: string;
  description?: string;
  imageUrl: string;
  attributes: Record<string, unknown>[];
};

export function Asset() {
  const { tokenId } = useParams<{
    tokenId: string;
  }>();
  const { address } = useAccount();
  const { chainId } = useConnection();
  const { status, data } = useErc721BalancesQuery({ address });
  const { indexerUrl } = useIndexerAPI();

  const location = useLocation();

  const { collection: col, asset } = useMemo<{
    collection?: Collection;
    asset?: Asset;
  }>(() => {
    const a = data?.tokenBalances?.edges.find(
      (e) => (e.node.tokenMetadata as Erc721__Token).tokenId === tokenId,
    )?.node.tokenMetadata as Erc721__Token | undefined;
    if (!a) {
      return {};
    }

    let attributes;
    try {
      attributes = JSON.parse(a.metadataAttributes);
    } catch {
      console.log("Failed to parse attributes");
    }

    const asset = {
      tokenId: a.tokenId,
      name: a.metadataName,
      description: a.metadataDescription,
      imageUrl: `${indexerUrl.replace("/graphql", "")}/static/${a?.imagePath}`,
      attributes,
    };

    const collection = {
      address: a.contractAddress,
      name: a.name,
      type: "ERC-721",
    };

    return {
      collection,
      asset,
    };
  }, [data, tokenId, indexerUrl]);

  return (
    <LayoutContainer
      left={
        <Link to=".." state={location.state}>
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
            if (!col || !asset) {
              return <LayoutContentLoader />;
            }
            return (
              <>
                <LayoutHeader
                  title={asset.name}
                  description={
                    <CopyText
                      value={col.name}
                      copyValue={addAddressPadding(col.address)}
                    />
                  }
                  icon={asset.imageUrl ?? "/public/placeholder.svg"}
                />

                <LayoutContent className="pb-4">
                  <div className="flex place-content-center">
                    <div
                      className="w-[60%] aspect-square rounded-lg bg-cover bg-center flex py-4 place-content-center overflow-hidden p-4"
                      style={{
                        backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${
                          asset.imageUrl ?? "/public/placeholder.svg"
                        })`,
                      }}
                    >
                      <img
                        className="object-contain"
                        src={asset.imageUrl ?? "/public/placeholder.svg"}
                      />
                    </div>
                  </div>

                  {asset.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>

                      <CardContent>{asset.description}</CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="h-10 flex flex-row items-center justify-between">
                      <CardTitle>Properties</CardTitle>
                    </CardHeader>

                    <CardContent className="bg-background grid grid-cols-3 p-0">
                      {/* {asset.attributes.map((a) => (
                  <div
                    key={`${a.type}-${a.name}`}
                    className="bg-secondary p-3 flex flex-col gap-1"
                  >
                    <div className="uppercase text-muted-foreground text-2xs font-bold">
                      {a.name}
                    </div>
                    <div className="text-xs font-medium">{a.value}</div>
                  </div>
                ))} */}
                      {Array.from({
                        length: 3 - (asset.attributes.length % 3),
                      }).map((_, i) => (
                        <div
                          key={`placeholder-${i}`}
                          className="bg-secondary p-3 flex flex-col gap-1"
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>details</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-muted-foreground">Contract</div>
                      {isPublicChain(chainId) ? (
                        <Link
                          to={StarkscanUrl(
                            chainId as constants.StarknetChainId,
                          ).contract(col.address)}
                          className="flex items-center gap-1 text-sm"
                          target="_blank"
                        >
                          <div className="font-medium">
                            {formatAddress(col.address, { size: "sm" })}
                          </div>
                          <ExternalIcon size="sm" />
                        </Link>
                      ) : (
                        <div>{formatAddress(col.address, { size: "sm" })}</div>
                      )}
                    </CardContent>

                    <CardContent className="flex items-center justify-between">
                      <div className="text-muted-foreground">Token ID</div>
                      <div className="font-medium">{asset.tokenId}</div>
                    </CardContent>

                    <CardContent className="flex items-center justify-between">
                      <div className="text-muted-foreground">
                        Token Standard
                      </div>
                      <div className="font-medium">{col.type}</div>
                    </CardContent>
                  </Card>
                </LayoutContent>
              </>
            );
          }
        }
      })()}
    </LayoutContainer>
  );
}
