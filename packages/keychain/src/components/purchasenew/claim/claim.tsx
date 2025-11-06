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
import { ControllerErrorAlert } from "@/components/ErrorAlert";
import { CollectionItem } from "../starterpack/collections";
import { StarterpackReceiving } from "../starterpack/starterpack";
import { ExternalWalletType, StarterPackItemType } from "@cartridge/controller";
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
    ethereumPreimage,
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
    type: type as ExternalWalletType | "controller" | "preimage",
    ethereumPreimage,
  });

  const wallet = useMemo(() => {
    // For preimage mode, show a generic wallet representation
    if (type === "preimage") {
      return {
        type: "preimage" as const,
        name: "Ethereum Wallet",
        subIcon: null,
        icon: null,
      };
    }
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
      .reduce((acc, claim) => acc + Number(claim.data[0] || 0), 0);
  }, [claimsData]);

  // Filter starterpack items based on matchStarterpackItem flag
  const filteredStarterpackItems = useMemo(() => {
    if (!starterpackDetails?.starterPackItems) {
      return undefined;
    }

    // Check if ANY claim requires filtering
    const shouldFilterItems = claimsData.some(
      (claim) => claim.matchStarterpackItem === true,
    );

    if (!shouldFilterItems) {
      return starterpackDetails.starterPackItems;
    }

    // Get eligible claim names from unclaimed claims
    const eligibleNames = claimsData
      .filter((claim) => !claim.claimed)
      .map((claim) => claim.description ?? claim.key)
      .filter((name): name is string => name !== null);

    // Filter items by name match
    const filteredItems = starterpackDetails.starterPackItems.filter((item) =>
      eligibleNames.some(
        (name) =>
          item.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(item.name.toLowerCase()),
      ),
    );

    // Fallback to all items if no matches found
    return filteredItems.length > 0
      ? filteredItems
      : starterpackDetails.starterPackItems;
  }, [claimsData, starterpackDetails]);

  // Set claim items based on filtered starterpack items for display on pending/success screens
  useEffect(() => {
    if (!filteredStarterpackItems || filteredStarterpackItems.length === 0) {
      setClaimItems([]);
      return;
    }

    // Check if we should prepend amounts (when matchStarterpackItem is enabled)
    const shouldPrependAmount = claimsData.some(
      (claim) => claim.matchStarterpackItem === true,
    );

    const items: Item[] = filteredStarterpackItems.map((item) => {
      let title = item.name;

      // Prepend claim amount to item name if matching is enabled
      if (shouldPrependAmount) {
        // Find matching claim(s) for this item
        const matchingClaims = claimsData.filter(
          (claim) =>
            !claim.claimed &&
            (claim.description
              ?.toLowerCase()
              .includes(item.name.toLowerCase()) ||
              item.name
                .toLowerCase()
                .includes(claim.description?.toLowerCase() ?? "") ||
              claim.key.toLowerCase().includes(item.name.toLowerCase()) ||
              item.name.toLowerCase().includes(claim.key.toLowerCase())),
        );

        // Calculate total amount from matching claims
        const totalAmount = matchingClaims.reduce(
          (acc, claim) => acc + Number(claim.data[0] || 0),
          0,
        );

        if (totalAmount > 0) {
          title = `(${totalAmount}) ${item.name}`;
        }
      }

      return {
        title,
        subtitle: item.description,
        icon: item.iconURL ?? <GiftIcon variant="solid" />,
        value: item.amount,
        type:
          item.type === StarterPackItemType.NONFUNGIBLE
            ? ItemType.NFT
            : ItemType.ERC20,
      };
    });

    setClaimItems(items);
  }, [filteredStarterpackItems, claimsData, setClaimItems]);

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
        .reduce((acc, c) => acc + Number(c.data[0] || 0), 0),
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
              starterpackItems={filteredStarterpackItems}
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
                            numAvailable={
                              claim.claimed ? 0 : Number(claim.data[0] || 0)
                            }
                            isLoading={claim.loading}
                          />
                          {!claim.loading && (
                            <Button
                              onClick={() => onSubmitIndividual(i)}
                              isLoading={claimingIndices.has(i)}
                              disabled={claimingIndices.has(i) || claim.claimed}
                              className="h-6 w-[70px] px-2 text-xs"
                            >
                              {claim.claimed ? "Claimed" : "Claim"}
                            </Button>
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
                        </CardListItem>
                      ))}
                </CardListContent>
              </Card>
            </div>
          </div>
        )}
      </LayoutContent>
      <LayoutFooter>
        {error && <ControllerErrorAlert error={error} />}
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
        ) : (
          !showIndividualClaims && (
            <Button
              onClick={onSubmit}
              isLoading={isSubmitting || isCheckingClaimed}
              disabled={isClaimed || isCheckingClaimed}
            >
              {isClaimed
                ? "Already Claimed"
                : groupedClaims.length > 1
                  ? `Claim All (${totalClaimable})`
                  : `Claim (${totalClaimable})`}
            </Button>
          )
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
