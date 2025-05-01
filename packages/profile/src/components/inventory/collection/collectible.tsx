import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutContainer,
  LayoutContent,
  LayoutContentError,
  LayoutContentLoader,
  LayoutHeader,
  Button,
  CollectiblePreview,
  Property,
  CollectibleProperties,
  CollectibleDetails,
  LayoutFooter,
  cn,
} from "@cartridge/ui-next";
import { constants } from "starknet";
import { useConnection } from "#hooks/context";
import { useCallback, useMemo } from "react";
import { useCollection } from "#hooks/collection";
import { compare } from "compare-versions";
import { CollectionHeader } from "./header";
import placeholder from "/public/placeholder.svg";
import { formatName } from "../helper";

export function Collectible() {
  const { chainId, version, visitor } = useConnection();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const compatibility = useMemo(() => {
    if (!version) return false;
    return compare(version, "0.5.6", ">=");
  }, [version]);

  const { address: contractAddress, tokenId } = useParams();
  const { collection, assets, status } = useCollection({
    contractAddress: contractAddress,
    tokenIds: tokenId ? [tokenId] : [],
  });

  const asset = useMemo(() => {
    return assets?.[0];
  }, [assets]);

  const title = useMemo(() => {
    if (!asset) return "";
    return formatName(asset.name, asset.tokenId);
  }, [asset]);

  const properties: Property[] = useMemo(() => {
    if (!asset) return [];
    return asset.attributes
      .filter((a) => !!(a.trait_type || a.trait) && !!a.value)
      .map((attribute) => ({
        name: (attribute.trait_type ?? attribute.trait) as string,
        value: attribute.value as string | number | null | undefined,
      }));
  }, [asset]);

  const handleBack = useCallback(() => {
    navigate(`..?${searchParams.toString()}`);
  }, [navigate, searchParams]);

  if (location.pathname.includes("/send")) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      {(() => {
        switch (status) {
          case "loading": {
            return (
              <>
                <LayoutHeader className="hidden" onBack={handleBack} />
                <LayoutContentLoader />
              </>
            );
          }
          case "error": {
            return (
              <>
                <LayoutHeader className="hidden" onBack={handleBack} />
                <LayoutContentError />
              </>
            );
          }
          default: {
            if (!collection || !asset) {
              return (
                <>
                  <LayoutHeader className="hidden" onBack={handleBack} />
                  <LayoutContentLoader />
                </>
              );
            }
            return (
              <>
                <LayoutHeader className="hidden" onBack={handleBack} />
                <LayoutContent className="p-6 flex flex-col gap-4">
                  <CollectionHeader
                    image={asset.imageUrl || placeholder}
                    title={title}
                    subtitle={
                      <p className="text-foreground-300 text-xs">
                        {collection.name}
                      </p>
                    }
                  />
                  <CollectiblePreview
                    image={asset.imageUrl || placeholder}
                    size="lg"
                    className="w-full self-center"
                  />
                  {properties.length > 0 && (
                    <CollectibleProperties properties={properties} />
                  )}
                  <CollectibleDetails
                    chainId={chainId as constants.StarknetChainId}
                    address={collection.address}
                    tokenId={asset.tokenId}
                    standard={collection.type}
                  />
                </LayoutContent>

                <LayoutFooter
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-y-4 bg-background pt-0",
                    (!compatibility || visitor) && "hidden",
                  )}
                >
                  <Link
                    className="flex items-center justify-center gap-x-4 w-full"
                    to={`send?${searchParams.toString()}`}
                  >
                    <Button className="h-10 w-full">Send</Button>
                  </Link>
                </LayoutFooter>
              </>
            );
          }
        }
      })()}
    </LayoutContainer>
  );
}
