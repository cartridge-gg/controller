import { type MerkleDrop } from "@/hooks/starterpack";
import {
  ArbitrumColorIcon,
  BaseColorIcon,
  Card,
  CardContent,
  EthereumColorIcon,
  OptimismColorIcon,
  StarknetColorIcon,
} from "@cartridge/ui";
import { MerkleDropNetwork } from "@cartridge/ui/utils/api/cartridge";
import React, { useCallback } from "react";

export const MerkleDrops = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    merkleDrops: MerkleDrop[];
  }
>(({ merkleDrops, ...props }, ref) => {
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
          {merkleDrops.map((merkleDrop) => (
            <MerkleItem
              key={`${merkleDrop.network}`}
              image="https://placehold.co/80x80/161a17/ffffff"
              network={merkleDrop.network}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

const MerkleItem = ({
  image,
  network,
}: {
  image: string;
  network: MerkleDropNetwork;
}) => {
  const networkIcon = useCallback((network: MerkleDropNetwork) => {
    switch (network) {
      case MerkleDropNetwork.Starknet:
        return <StarknetColorIcon size="xs" key={network} />;
      case MerkleDropNetwork.Ethereum:
        return <EthereumColorIcon size="xs" key={network} />;
      case MerkleDropNetwork.Base:
        return <BaseColorIcon size="xs" key={network} />;
      case MerkleDropNetwork.Arbitrum:
        return <ArbitrumColorIcon size="xs" key={network} />;
      case MerkleDropNetwork.Optimism:
        return <OptimismColorIcon size="xs" key={network} />;
      default:
        return null;
    }
  }, []);
  return (
    <div className="p-1 rounded-md bg-background-300 overflow-hidden relative">
      <div className="absolute p-1 top-2 right-2 bg-background-200 rounded-md flex flex-row gap-1">
        {networkIcon(network)}
      </div>
      <img src={image} className="rounded-md" />
    </div>
  );
};
