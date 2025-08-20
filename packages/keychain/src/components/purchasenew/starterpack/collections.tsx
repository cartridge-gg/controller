import { ExternalPlatform } from "@cartridge/controller";
import {
  ArbitrumColorIcon,
  BaseColorIcon,
  Card,
  CardContent,
  EthereumColorIcon,
  OptimismColorIcon,
  StarknetColorIcon,
} from "@cartridge/ui";
import React, { useCallback } from "react";

export interface CollectionItem {
  name: string;
  image: string;
  platforms: ExternalPlatform[];
}

export const Collections = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    collections: CollectionItem[];
  }
>(({ collections, ...props }, ref) => {
  return (
    <Card
      className="relative bg-background-100 overflow-visible"
      ref={ref}
      {...props}
    >
      <CardContent className="py-3 px-4 overflow-visible h-full rounded-lg flex flex-col gap-3">
        <div className="text-xs font-semibold text-foreground-400">
          Supported Collections
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] justify-start gap-2 overflow-x-auto">
          {collections.map((collection) => (
            <Collection key={collection.name} {...collection} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

const Collection = ({ image, platforms }: CollectionItem) => {
  const networkIcon = useCallback((platform: ExternalPlatform) => {
    switch (platform) {
      case "starknet":
        return <StarknetColorIcon size="xs" key={platform} />;
      case "ethereum":
        return <EthereumColorIcon size="xs" key={platform} />;
      case "base":
        return <BaseColorIcon size="xs" key={platform} />;
      case "arbitrum":
        return <ArbitrumColorIcon size="xs" key={platform} />;
      case "optimism":
        return <OptimismColorIcon size="xs" key={platform} />;
      default:
        return null;
    }
  }, []);
  return (
    <div className="p-1 rounded-md bg-background-300 overflow-hidden relative">
      <div className="absolute p-1 top-2 right-2 bg-background-200 rounded-md flex flex-row gap-1">
        {platforms.map((platform) => networkIcon(platform))}
      </div>
      <img src={image} className="rounded-md" />
    </div>
  );
};
