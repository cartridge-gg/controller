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
  LayoutFooter,
  LayoutHeader,
  Button,
  CheckboxIcon,
  cn,
  CopyAddress,
} from "@cartridge/ui-next";
import { useCallback, useMemo } from "react";
import { useCollection } from "#hooks/collection";
import { Collectibles } from "./collectibles";
import placeholder from "/public/placeholder.svg";
import { addAddressPadding } from "starknet";
import { CollectionHeader } from "./header";

export function Collection() {
  const { address: contractAddress, tokenId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenIds = searchParams.getAll("tokenIds");
  const { collection, assets, status } = useCollection({ contractAddress });

  const selection = useMemo(() => {
    return tokenIds.length > 0;
  }, [tokenIds]);

  const handleSelectAll = useCallback(() => {
    if (!assets) return;
    const options = {
      tokenIds: tokenIds.length ? [] : assets.map((asset) => asset.tokenId),
    };
    setSearchParams(options);
  }, [assets, tokenIds, setSearchParams]);

  const handleSelect = useCallback(
    (tokenId: string) => {
      const isSelected = tokenIds.includes(tokenId);
      setSearchParams({
        tokenIds: isSelected
          ? tokenIds.filter((id) => id !== tokenId)
          : [...tokenIds, tokenId],
      });
    },
    [tokenIds, setSearchParams],
  );

  if (tokenId || location.pathname.includes("/send")) {
    return <Outlet />;
  }

  return (
    <LayoutContainer>
      {(() => {
        switch (status) {
          case "loading": {
            return (
              <>
                <LayoutHeader
                  className="hidden"
                  onBack={() => navigate("..")}
                />
                <LayoutContentLoader />
              </>
            );
          }
          case "error": {
            return (
              <>
                <LayoutHeader
                  className="hidden"
                  onBack={() => navigate("..")}
                />
                <LayoutContentError />
              </>
            );
          }
          default: {
            if (!collection || !assets) {
              return (
                <>
                  <LayoutHeader
                    className="hidden"
                    onBack={() => navigate("..")}
                  />
                  <LayoutContentLoader />
                </>
              );
            }

            return (
              <>
                <LayoutHeader
                  className="hidden"
                  onBack={() => navigate("..")}
                />
                <LayoutContent className={cn("p-6 flex flex-col gap-y-4")}>
                  <CollectionHeader
                    image={collection.imageUrl || placeholder}
                    title={collection.name}
                    subtitle={
                      <CopyAddress
                        address={addAddressPadding(collection.address!)}
                        size="xs"
                      />
                    }
                  />

                  <div
                    className="flex items-center gap-x-1.5 text-xs cursor-pointer self-start text-foreground-300"
                    onClick={handleSelectAll}
                  >
                    <CheckboxIcon
                      className={cn(selection && "text-foreground-100")}
                      variant={selection ? "minus-line" : "unchecked-line"}
                      size="sm"
                    />
                    <div>
                      {selection ? `${tokenIds.length} Selected` : "Select all"}
                    </div>
                  </div>

                  <Collectibles
                    assets={assets}
                    tokenIds={tokenIds}
                    selection={selection}
                    handleSelect={handleSelect}
                  />
                </LayoutContent>

                <LayoutFooter
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-y-4 bg-background",
                    !selection && "hidden",
                  )}
                >
                  <Link
                    className="flex items-center justify-center gap-x-4 w-full"
                    to={`send?${searchParams.toString()}`}
                  >
                    <Button className="w-full">{`Send (${tokenIds.length})`}</Button>
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
