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
  Separator,
} from "@cartridge/ui-next";
import { useCallback, useMemo } from "react";
import { CollectionImage } from "./image";
import { useCollection } from "#hooks/collection";
import { Collectibles } from "./collectibles";

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
            return <LayoutContentLoader />;
          }
          case "error": {
            return <LayoutContentError />;
          }
          default: {
            if (!collection || !assets) {
              return <LayoutContentLoader />;
            }

            return (
              <>
                <LayoutHeader
                  title={collection.name}
                  description={
                    <CopyAddress address={collection.address!} size="sm" />
                  }
                  icon={
                    <CollectionImage
                      imageUrl={collection.imageUrl || undefined}
                      size="xs"
                    />
                  }
                  onBack={() => {
                    navigate("..");
                  }}
                />

                <LayoutContent
                  className={cn(
                    "pb-0 flex flex-col gap-y-4",
                    !selection && "pb-4",
                  )}
                >
                  <div
                    className="flex items-center gap-x-1.5 text-[11px]/3 cursor-pointer font-semibold self-start"
                    onClick={handleSelectAll}
                  >
                    <CheckboxIcon
                      variant={selection ? "minus-line" : "unchecked-line"}
                      size="sm"
                    />
                    <div className="text-foreground-400 font-semibold uppercase">
                      {selection ? `${tokenIds.length} selected` : "Select all"}
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
                    "relative flex flex-col items-center justify-center gap-y-4 pb-6 px-4 bg-background pt-0",
                    !selection && "hidden",
                  )}
                >
                  <Separator orientation="horizontal" className="bg-spacer" />
                  <Link
                    className="flex items-center justify-center gap-x-4 w-full"
                    to={`send?${searchParams.toString()}`}
                  >
                    <Button className="w-full">Send</Button>
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
