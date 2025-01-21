import { Link, Outlet, useLocation, useParams } from "react-router-dom";
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
  ScrollArea,
  Separator,
} from "@cartridge/ui-next";
import { addAddressPadding, constants } from "starknet";
import {
  formatAddress,
  isIframe,
  isPublicChain,
  StarkscanUrl,
} from "@cartridge/utils";
import { useConnection } from "@/hooks/context";
import { useMemo } from "react";
import { Hex, hexToNumber } from "viem";
import { Asset, Collection, useCollection } from "@/hooks/collection";
import { compare } from "compare-versions";

export function Collectible() {
  const { chainId, version } = useConnection();
  const location = useLocation();

  const compatibility = useMemo(() => {
    if (!version) return false;
    return compare(version, "0.5.6", ">=");
  }, [version]);

  const { tokenId } = useParams<{ tokenId: string }>();
  const { collection, assets, status } = useCollection({
    tokenIds: tokenId ? [tokenId] : [],
  });

  const asset = useMemo(() => {
    return assets?.[0];
  }, [assets]);

  if (location.pathname.includes("/send")) {
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
            if (!collection || !asset) {
              return <LayoutContentLoader />;
            }
            const assets = (asset.attributes || []).filter(
              (a) => !!(a.trait_type || a.trait) && !!a.value,
            );
            return (
              <>
                <LayoutHeader
                  title={`${asset.name || ""} #${parseInt(asset.tokenId, 16)}`}
                  description={
                    <CopyText
                      value={collection.name}
                      copyValue={addAddressPadding(collection.address)}
                    />
                  }
                  icon={asset.imageUrl ?? "/public/placeholder.svg"}
                />

                <LayoutContent>
                  <ScrollArea>
                    <div className="flex flex-col h-full flex-1 overflow-y-auto gap-y-4">
                      <Image imageUrl={asset.imageUrl} />
                      <Description description={asset.description} />
                      <Properties properties={assets} />
                      <Details
                        chainId={chainId as constants.StarknetChainId}
                        col={collection}
                        asset={asset}
                      />
                    </div>
                  </ScrollArea>
                </LayoutContent>

                {isIframe() && compatibility && (
                  <div className="flex flex-col items-center justify-center gap-y-4 pb-6 px-4">
                    <Separator orientation="horizontal" className="bg-spacer" />
                    <Link
                      className="flex items-center justify-center gap-x-4 w-full"
                      to="send"
                    >
                      <Button className="h-10 w-full">Send</Button>
                    </Link>
                  </div>
                )}
              </>
            );
          }
        }
      })()}
    </LayoutContainer>
  );
}

export const Image = ({ imageUrl }: { imageUrl: string | undefined }) => {
  return (
    <div className="flex place-content-center">
      <div
        className="w-[60%] aspect-square rounded-lg bg-cover bg-center flex py-4 place-content-center overflow-hidden p-4"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${
            imageUrl || "/public/placeholder.svg"
          })`,
        }}
      >
        <img
          className="object-contain"
          src={imageUrl || "/public/placeholder.svg"}
        />
      </div>
    </div>
  );
};

export const Description = ({
  description,
}: {
  description: string | undefined;
}) => {
  if (!description) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="uppercase text-[11px] text-quaternary-foreground font-bold tracking-wider">
          Description
        </CardTitle>
      </CardHeader>

      <CardContent>{description}</CardContent>
    </Card>
  );
};

export const Properties = ({
  properties,
}: {
  properties: Record<string, unknown>[];
}) => {
  if (properties.length === 0) return null;
  return (
    <Card>
      <CardHeader className="h-10 flex flex-row items-center justify-between">
        <CardTitle className="uppercase text-[11px] text-quaternary-foreground font-bold tracking-wider">
          Properties
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-background grid grid-cols-3 p-0 gap-px">
        {properties.map((property) => {
          const trait = property.trait_type ?? property.trait;
          return typeof property.value === "string" ? (
            <div
              key={`${trait}-${property.value}`}
              className="bg-secondary p-3 flex flex-col gap-1"
            >
              {typeof trait === "string" ? (
                <div className="uppercase text-muted-foreground text-2xs font-bold">
                  {trait}
                </div>
              ) : null}
              <div className="text-xs font-medium">
                {String(property.value)}
              </div>
            </div>
          ) : null;
        })}
        {Array.from({ length: 2 - ((properties.length - 1) % 3) }).map(
          (_, i) => (
            <div
              key={`fill-${i}`}
              className="bg-secondary p-3 flex flex-col gap-1"
            />
          ),
        )}
      </CardContent>
    </Card>
  );
};

export const Details = ({
  chainId,
  col,
  asset,
}: {
  chainId: constants.StarknetChainId;
  col: Collection;
  asset: Asset;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="uppercase text-[11px] text-quaternary-foreground font-bold tracking-wider">
          details
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-muted-foreground">Contract Address</div>
        {isPublicChain(chainId) ? (
          <Link
            to={StarkscanUrl(chainId).contract(col.address)}
            className="flex items-center gap-x-1.5 text-sm"
            target="_blank"
          >
            <div className="font-medium">
              {formatAddress(col.address, { size: "xs" })}
            </div>
            <ExternalIcon size="sm" />
          </Link>
        ) : (
          <div>{formatAddress(col.address, { size: "sm" })}</div>
        )}
      </CardContent>

      <CardContent className="flex items-center justify-between gap-4">
        <div className="text-muted-foreground whitespace-nowrap">Token ID</div>
        <div className="font-medium truncate">
          {asset.tokenId.startsWith("0x")
            ? hexToNumber(asset.tokenId as Hex)
            : asset.tokenId}
        </div>
      </CardContent>

      <CardContent className="flex items-center justify-between">
        <div className="text-muted-foreground">Token Standard</div>
        <div className="font-medium">{col.type}</div>
      </CardContent>
    </Card>
  );
};
