import { useNavigation } from "@/context";
import {
  Button,
  Card,
  CardListContent,
  CardListItem,
  Empty,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Skeleton,
} from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMerkleClaim, MerkleClaim } from "@/hooks/merkle-claim";
import { Item, ItemType, usePurchaseContext } from "@/context/purchase";
import { ErrorAlert } from "@/components/ErrorAlert";
import { CollectionItem } from "../starterpack/collections";
import { StarterpackReceiving } from "../starterpack/starterpack";
import { ExternalWalletType } from "@cartridge/controller";
import { getWallet } from "../wallet/config";
import { formatAddress } from "@cartridge/ui/utils";
import type { BackendStarterpackDetails } from "@/context";

export function Claim() {
  const { keys, address: externalAddress, type } = useParams();
  const { goBack, navigate } = useNavigation();
  const {
    starterpackDetails: starterpackDetailsRaw,
    setClaimItems,
    setTransactionHash,
  } = usePurchaseContext();

  const starterpackDetails = starterpackDetailsRaw as
    | BackendStarterpackDetails
    | undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showIndividualClaims, setShowIndividualClaims] = useState(false);
  const [claimingIndices, setClaimingIndices] = useState<Set<number>>(
    new Set(),
  );

  const {
    claims: claimsData,
    isLoading: isLoadingClaims,
    onSendClaim,
  } = useMerkleClaim({
    keys: keys!,
    address: externalAddress!,
    type: type as ExternalWalletType | "controller",
  });

  useEffect(() => {
    if (claimsData.length === 0) {
      setClaimItems([]);
      return;
    }

    const items: Item[] = [];
    claimsData
      .filter((c) => !c.claimed)
      .forEach((c) => {
        c.data.forEach((d) => {
          items.push({
            title: `(${Number(d)}) ${c.description ?? c.key}`,
            type: ItemType.NFT,
            icon: <GiftIcon variant="solid" />,
          });
        });
      });

    setClaimItems(items);
  }, [claimsData, setClaimItems]);

  const wallet = useMemo(() => {
    return getWallet(type as ExternalWalletType | "controller");
  }, [type]);

  const onSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const hash = await onSendClaim();
      setTransactionHash(hash);
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      setError(error as Error);
      // Fallback to individual claims on error
      setShowIndividualClaims(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSendClaim, setTransactionHash, navigate]);

  const onSubmitIndividual = useCallback(
    async (claimIndex: number) => {
      try {
        setClaimingIndices((prev) => new Set(prev).add(claimIndex));
        setError(null);
        const hash = await onSendClaim([claimIndex]);
        setTransactionHash(hash);
        navigate("/purchase/pending", { reset: true });
      } catch (error) {
        setError(error as Error);
      } finally {
        setClaimingIndices((prev) => {
          const next = new Set(prev);
          next.delete(claimIndex);
          return next;
        });
      }
    },
    [onSendClaim, setTransactionHash, navigate],
  );

  const isClaimed = useMemo(() => {
    return claimsData.every((claim) => claim.claimed);
  }, [claimsData]);

  const isCheckingClaimed = useMemo(() => {
    return claimsData.every((claim) => claim.loading);
  }, [claimsData]);

  const totalClaimable = useMemo(() => {
    return claimsData
      .filter((claim) => !claim.claimed)
      .reduce((acc, claim) => acc + claimAmount(claim), 0);
  }, [claimsData]);

  // Group claims by key (e.g., network/collection)
  const groupedClaims = useMemo(() => {
    const groups = new Map<
      string,
      { claims: MerkleClaim[]; indices: number[] }
    >();

    claimsData.forEach((claim, index) => {
      if (!groups.has(claim.key)) {
        groups.set(claim.key, { claims: [], indices: [] });
      }
      groups.get(claim.key)!.claims.push(claim);
      groups.get(claim.key)!.indices.push(index);
    });

    return Array.from(groups.entries()).map(([key, { claims, indices }]) => ({
      key,
      claims,
      indices,
      description: claims[0].description ?? key,
      network: claims[0].network,
      totalAmount: claims
        .filter((c) => !c.claimed)
        .reduce((acc, c) => acc + claimAmount(c), 0),
      allClaimed: claims.every((c) => c.claimed),
      isLoading: claims.every((c) => c.loading),
    }));
  }, [claimsData]);

  if (isLoadingClaims) {
    return <LoadingState />;
  }

  return (
    <>
      <HeaderInner
        title="Claim Starterpack"
        icon={<GiftIcon variant="solid" />}
      />
      <LayoutContent>
        {claimsData.length === 0 ? (
          <Empty
            icon="claim"
            title="Nothing to claim from this wallet"
            className="h-full md:h-[420px]"
          />
        ) : (
          <div className="flex flex-col gap-4">
            <StarterpackReceiving
              mintAllowance={starterpackDetails?.mintAllowance}
              starterpackItems={starterpackDetails?.starterPackItems}
            />
            <div className="flex flex-col gap-2">
              <div className="text-foreground-400 text-xs font-semibold">
                Your Collections
              </div>
              <Card>
                <CardListContent>
                  {showIndividualClaims
                    ? // Show individual claims with individual claim buttons
                    claimsData.map((claim, i) => (
                      <CardListItem
                        key={i}
                        className="flex flex-row justify-between items-center"
                      >
                        <CollectionItem
                          name={claim.description ?? claim.key}
                          network={claim.network}
                          numAvailable={claimAmount(claim)}
                          isLoading={claim.loading}
                        />
                        {!claim.claimed && !claim.loading && (
                          <Button
                            onClick={() => onSubmitIndividual(i)}
                            isLoading={claimingIndices.has(i)}
                            disabled={claimingIndices.has(i)}
                            className="h-8 px-3 text-xs"
                          >
                            Claim
                          </Button>
                        )}
                        {claim.claimed && (
                          <span className="text-foreground-400 text-xs">
                            Claimed
                          </span>
                        )}
                      </CardListItem>
                    ))
                    : // Show grouped display by claim key (no buttons, use "Claim All" in footer)
                    groupedClaims.map((group) => (
                      <CardListItem
                        key={group.key}
                        className="flex flex-row justify-between items-center"
                      >
                        <CollectionItem
                          name={group.description}
                          network={group.network}
                          numAvailable={group.totalAmount}
                          isLoading={group.isLoading}
                        />
                        {group.allClaimed && (
                          <span className="text-foreground-400 text-xs">
                            Claimed
                          </span>
                        )}
                      </CardListItem>
                    ))}
                </CardListContent>
              </Card>
            </div>
          </div>
        )}
      </LayoutContent>
      <LayoutFooter>
        {error && (
          <ErrorAlert
            title="Error"
            description={
              showIndividualClaims
                ? error.message
                : `${error.message}. Switched to individual claiming mode.`
            }
          />
        )}
        <div className="flex justify-between border border-background-300 rounded py-2 px-3">
          <div className="flex items-center gap-1 text-foreground-300 text-xs">
            {wallet.subIcon} {wallet.name} (
            {formatAddress(externalAddress!, { first: 5, last: 4 })})
          </div>
          <div className="flex items-center gap-1 text-foreground-300 text-xs">
            Connected
          </div>
        </div>
        {claimsData.length === 0 ? (
          <Button onClick={() => goBack()}>Check Another Wallet</Button>
        ) : showIndividualClaims ? (
          <div className="text-foreground-300 text-sm text-center">
            Claim items individually above
          </div>
        ) : (
          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={isClaimed || isCheckingClaimed}
          >
            {isClaimed
              ? "Already Claimed"
              : isCheckingClaimed
                ? "Loading..."
                : `Claim All (${totalClaimable})`}
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}

export const LoadingState = () => {
  return (
    <LayoutContent>
      <Skeleton className="min-h-10 w-full rounded" />
      <Skeleton className="min-h-10 w-full rounded" />
      <Skeleton className="min-h-[180px] w-full rounded" />
      <Skeleton className="min-h-[180px] w-full rounded" />
    </LayoutContent>
  );
};

const claimAmount = (claim: MerkleClaim) => {
  if (claim.data.length === 1) {
    return Number(claim.data[0]);
  }

  return claim.data.length;
};
