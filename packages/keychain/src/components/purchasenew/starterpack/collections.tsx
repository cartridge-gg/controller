import {
  useNavigation,
  useStarterpackContext,
  type BackendStarterpackDetails,
} from "@/context";
import { MerkleDrop } from "@/hooks/starterpack";
import { humanizeString } from "@cartridge/controller";
import {
  ArbitrumIcon,
  BaseIcon,
  Button,
  Card,
  CardListContent,
  CardListItem,
  EthereumIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  OptimismIcon,
  Spinner,
  StarknetIcon,
  Thumbnail,
} from "@cartridge/ui";
import { MerkleDropNetwork } from "@cartridge/ui/utils/api/cartridge";
import { useCallback } from "react";

export const Collections = () => {
  const { isStarterpackLoading, starterpackDetails: detailsRaw } =
    useStarterpackContext();

  // MerkleDrops are backend-only (part of claims), so we can safely cast
  const details = detailsRaw as BackendStarterpackDetails | undefined;

  if (isStarterpackLoading || !details) {
    return <></>;
  }

  return (
    <CollectionsInner name={details.name} merkleDrops={details.merkleDrops} />
  );
};

export const CollectionsInner = ({
  name,
  merkleDrops = [],
}: {
  name: string;
  merkleDrops?: MerkleDrop[];
  error?: Error | null;
}) => {
  const { goBack } = useNavigation();

  return (
    <>
      <HeaderInner title={name} hideIcon />
      <LayoutContent>
        <div className="text-foreground-400 text-xs font-semibold">
          Eligible Collections
        </div>
        <Card>
          <CardListContent>
            {merkleDrops.map((drop) => (
              <CardListItem
                className="flex flex-row justify-between"
                key={drop.key}
              >
                <CollectionItem
                  name={drop.description ?? drop.key}
                  network={drop.network}
                />
              </CardListItem>
            ))}
          </CardListContent>
        </Card>
      </LayoutContent>
      <LayoutFooter>
        <Button variant="secondary" onClick={goBack}>
          Back
        </Button>
      </LayoutFooter>
    </>
  );
};

export const CollectionItem = ({
  name,
  network,
  numAvailable,
  isLoading,
}: {
  name: string;
  network: MerkleDropNetwork;
  numAvailable?: number;
  isLoading?: boolean;
}) => {
  const networkIcon = useCallback((network: MerkleDropNetwork) => {
    switch (network) {
      case MerkleDropNetwork.Starknet:
        return <StarknetIcon size="xs" />;
      case MerkleDropNetwork.Ethereum:
        return <EthereumIcon size="xs" />;
      case MerkleDropNetwork.Base:
        return <BaseIcon size="xs" />;
      case MerkleDropNetwork.Arbitrum:
        return <ArbitrumIcon size="xs" />;
      case MerkleDropNetwork.Optimism:
        return <OptimismIcon size="xs" />;
      default:
        return null;
    }
  }, []);

  return (
    <>
      <div className="flex flex-row gap-2">
        {numAvailable !== undefined && (
          <div className="flex items-center justify-center text-primary text-xs font-semibold rounded bg-background-300 min-w-[30px] px-2">
            {isLoading ? (
              <Spinner size="sm" className="p-0 m-0" />
            ) : (
              numAvailable
            )}
          </div>
        )}
        {name}
      </div>
      <div className="flex items-center gap-1 text-foreground-200 text-sm border border-background-300 group-hover:border-background-400 rounded pl-1 pr-2">
        <Thumbnail
          icon={networkIcon(network)}
          size="xs"
          className="text-foreground-200 p-0 group-hover:bg-background-300"
          rounded
        />
        {humanizeString(network)}
      </div>
    </>
  );
};
