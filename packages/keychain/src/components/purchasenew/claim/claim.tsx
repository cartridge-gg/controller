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
import { getWallet } from "../wallet/data";
import { formatAddress } from "@cartridge/ui/utils";

export function Claim() {
  const { keys, address: externalAddress, type } = useParams();
  const { goBack, navigate } = useNavigation();
  const { starterpackDetails, setClaimItems, setTransactionHash } =
    usePurchaseContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
    } finally {
      setIsSubmitting(false);
    }
  }, [onSendClaim, setTransactionHash, navigate]);

  const onClaimSingle = useCallback(
    async (claimIndex: number) => {
      try {
        setIsSubmitting(true);
        setError(null);
        const hash = await onSendClaim(claimIndex);
        setTransactionHash(hash);
        navigate("/purchase/pending", { reset: true });
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsSubmitting(false);
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
                  {claimsData.map((claim, i) => (
                    <CardListItem
                      key={i}
                      className={`flex flex-row justify-between cursor-pointer hover:bg-background-100 transition-colors ${
                        claim.claimed ? "opacity-50" : ""
                      }`}
                      onClick={() => !claim.claimed && onClaimSingle(i)}
                    >
                      <CollectionItem
                        name={claim.description ?? claim.key}
                        network={claim.network}
                        numAvailable={claimAmount(claim)}
                        isLoading={claim.loading}
                      />
                      {!claim.claimed && (
                        <div className="text-xs text-primary-500 font-medium">
                          Claim
                        </div>
                      )}
                      {claim.claimed && (
                        <div className="text-xs text-foreground-400">
                          Claimed
                        </div>
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
        {error && <ErrorAlert title="Error" description={error.message} />}
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
          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={isClaimed || isCheckingClaimed || error !== null}
          >
            {isClaimed
              ? "Already Claimed"
              : isCheckingClaimed
                ? "Loading..."
                : `Claim (${totalClaimable}) `}
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
