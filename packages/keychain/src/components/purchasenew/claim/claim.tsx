import { useNavigation } from "@/context";
import {
  Button,
  CardContent,
  Empty,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Skeleton,
} from "@cartridge/ui";
import { Receiving } from "../receiving";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../starterpack/badge";
import { useParams } from "react-router-dom";
import { useMerkleClaim } from "@/hooks/merkle-claim";
import { ItemType, usePurchaseContext } from "@/context/purchase";
import { ErrorAlert } from "@/components/ErrorAlert";

export function Claim() {
  const { key, address: externalAddress } = useParams();
  const { goBack, navigate } = useNavigation();
  const { claimItems, setClaimItems, setTransactionHash } =
    usePurchaseContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const {
    claims: claimsData,
    isClaimed,
    isLoading: isLoadingClaims,
    onSendClaim,
  } = useMerkleClaim({
    key: key!,
    address: externalAddress!,
  });

  useEffect(() => {
    if (claimsData.length === 0) {
      setClaimItems([]);
      return;
    }

    setClaimItems(
      claimsData[0].data.map((data) => ({
        title: data,
        type: ItemType.NFT,
        icon: <GiftIcon variant="solid" />,
      })),
    );
  }, [claimsData, setClaimItems]);

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
        {claimItems.length === 0 ? (
          <Empty
            icon="inventory"
            title="Nothing to Claim from this Wallet"
            className="h-full md:h-[420px]"
          />
        ) : (
          <Receiving title="Receiving" items={claimItems} showTotal />
        )}
      </LayoutContent>
      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}
        {claimItems.length > 0 && (
          <CardContent className="relative flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
            <div className="absolute -top-1 right-4">
              <Badge price={0} />
            </div>
            <div className="text-foreground-400 font-medium text-sm flex flex-row items-center gap-1">
              Network Fees
            </div>
          </CardContent>
        )}
        {claimItems.length === 0 ? (
          <Button onClick={() => goBack()}>Check Another Wallet</Button>
        ) : (
          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={isClaimed}
          >
            {isClaimed ? "Already Claimed" : "Claim"}
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
