import {
  Button,
  CheckIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { ControllerErrorAlert, ErrorAlert } from "@/components/ErrorAlert";
import { Receiving } from "./receiving";
import { useConnection } from "@/hooks/connection";
import {
  useStarterpackContext,
  useOnchainPurchaseContext,
  useCreditPurchaseContext,
  Item,
} from "@/context";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmingTransaction } from "./pending";
import { getExplorer } from "@/hooks/starterpack/layerswap";
import { StarterpackType } from "@/context";
import { useStarterpackPlayHandler } from "@/hooks/starterpack";
import {
  CoinflowPaymentStatus,
  PurchaseFulfillmentStatus,
  useCoinflowPaymentQuery,
} from "@/utils/api";
import { posthog } from "@/components/provider/posthog";
import { captureAnalyticsEvent } from "@/types/analytics";

export function Success() {
  const { starterpackDetails, transactionHash, claimItems } =
    useStarterpackContext();
  const { purchaseItems } = useOnchainPurchaseContext();
  const { coinflowIntent } = useCreditPurchaseContext();

  const items = useMemo(() => {
    if (starterpackDetails?.type === "claimed") {
      return claimItems;
    }

    return purchaseItems;
  }, [starterpackDetails, claimItems, purchaseItems]);

  if (starterpackDetails?.type === "onchain" && coinflowIntent) {
    return (
      <CoinflowPurchaseSuccess
        items={items}
        name={starterpackDetails.name}
        coinflowPaymentId={coinflowIntent.id}
      />
    );
  }

  return (
    <PurchaseSuccessInner
      items={items}
      type={starterpackDetails!.type}
      transactionHash={transactionHash}
    />
  );
}

type PurchaseStage = {
  title: string;
  status: "loading" | "success" | "error";
};

function getFulfillmentStage(
  fulfillmentStatus: PurchaseFulfillmentStatus | undefined,
): PurchaseStage {
  switch (fulfillmentStatus) {
    case PurchaseFulfillmentStatus.Confirmed:
      return {
        title: "Confirmed on Starknet",
        status: "success",
      };
    case PurchaseFulfillmentStatus.Failed:
      return {
        title: "Failed on Starknet",
        status: "error",
      };
    case PurchaseFulfillmentStatus.Submitted:
      return {
        title: "Submitted to Starknet",
        status: "loading",
      };
    default:
      return {
        title: "Purchasing on Starknet",
        status: "loading",
      };
  }
}

function getCoinflowPaymentStage(
  paymentStatus: CoinflowPaymentStatus | undefined,
): PurchaseStage {
  switch (paymentStatus) {
    case CoinflowPaymentStatus.Succeeded:
      return {
        title: "Confirmed on Coinflow",
        status: "success",
      };
    case CoinflowPaymentStatus.Failed:
      return {
        title: "Failed on Coinflow",
        status: "error",
      };
    default:
      return {
        title: "Confirming on Coinflow",
        status: "loading",
      };
  }
}

export function CoinflowPurchaseSuccess({
  items,
  name,
  coinflowPaymentId,
}: {
  items: Item[];
  name: string;
  coinflowPaymentId: string;
}) {
  const { quantity } = useOnchainPurchaseContext();
  const { isMainnet } = useConnection();
  const handlePlay = useStarterpackPlayHandler();
  const quantityText = quantity > 1 ? `(${quantity})` : "";

  const { data, error, isLoading, isFetching, refetch } =
    useCoinflowPaymentQuery(
      { id: coinflowPaymentId },
      {
        enabled: true,
        retry: false,
      },
    );

  const payment = data?.coinflowPayment;
  const paymentStatus = payment?.paymentStatus;
  const fulfillment = payment?.purchaseFulfillment;
  const fulfillmentStatus = fulfillment?.status;
  const transactionHash = fulfillment?.transactionHash ?? undefined;
  const [showOnchainStatus, setShowOnchainStatus] = useState(false);

  const isPaymentFailed = paymentStatus === CoinflowPaymentStatus.Failed;
  const isPurchaseComplete =
    fulfillmentStatus === PurchaseFulfillmentStatus.Confirmed;
  const isFulfillmentFailed =
    fulfillmentStatus === PurchaseFulfillmentStatus.Failed;

  const hasCapturedPurchase = useRef(false);

  useEffect(() => {
    if (isPurchaseComplete && !hasCapturedPurchase.current) {
      hasCapturedPurchase.current = true;
      captureAnalyticsEvent(posthog, "purchase_completed", {
        method: "coinflow",
      });
    }
  }, [isPurchaseComplete]);

  useEffect(() => {
    if (paymentStatus !== CoinflowPaymentStatus.Succeeded) {
      setShowOnchainStatus(false);
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setShowOnchainStatus(true);
    }, 300);

    return () => window.clearTimeout(revealTimer);
  }, [paymentStatus]);

  useEffect(() => {
    if (
      isLoading ||
      isFetching ||
      error ||
      isPaymentFailed ||
      isPurchaseComplete ||
      isFulfillmentFailed
    ) {
      return;
    }

    const pollTimer = window.setTimeout(() => {
      void refetch();
    }, 3000);

    return () => window.clearTimeout(pollTimer);
  }, [
    error,
    isFetching,
    isFulfillmentFailed,
    isLoading,
    isPaymentFailed,
    isPurchaseComplete,
    paymentStatus,
    fulfillmentStatus,
    refetch,
  ]);

  const statusError = useMemo(() => {
    if (error) {
      return error instanceof Error
        ? error
        : new Error("Unable to load Coinflow payment status.");
    }

    if (isPaymentFailed) {
      return new Error("Coinflow payment failed. Please try again.");
    }

    return undefined;
  }, [error, isPaymentFailed]);

  const paymentStage = getCoinflowPaymentStage(paymentStatus);
  const fulfillmentStage = getFulfillmentStage(fulfillmentStatus);

  return (
    <>
      <HeaderInner
        title={isPurchaseComplete ? "Purchase Complete" : `Purchasing ${name}`}
        icon={isPurchaseComplete ? <CheckIcon /> : undefined}
      />
      <LayoutContent>
        <Receiving
          title={`${isPurchaseComplete ? "You Received" : "Receiving"} ${quantityText}`}
          items={items}
          isLoading={false}
          showPrice={true}
        />
      </LayoutContent>
      <LayoutFooter>
        {isFulfillmentFailed ? (
          <ErrorAlert
            title="Purchase Failure"
            description={
              fulfillment?.lastError ||
              "Onchain purchase failed after Coinflow payment confirmation."
            }
            variant="error"
          />
        ) : statusError ? (
          <ControllerErrorAlert error={statusError} />
        ) : null}
        <div className="space-y-2">
          <ConfirmingTransaction
            title={paymentStage.title}
            status={paymentStage.status}
          />
          {showOnchainStatus && (
            <ConfirmingTransaction
              title={fulfillmentStage.title}
              status={fulfillmentStage.status}
              externalLink={
                transactionHash
                  ? getExplorer("starknet", transactionHash, isMainnet)?.url
                  : undefined
              }
            />
          )}
        </div>
        <Button onClick={handlePlay} disabled={!isPurchaseComplete}>
          Play
        </Button>
      </LayoutFooter>
    </>
  );
}

export function PurchaseSuccessInner({
  items,
  type,
  transactionHash,
}: {
  items: Item[];
  type: StarterpackType;
  transactionHash?: string;
}) {
  const { quantity } = useOnchainPurchaseContext();
  const { isMainnet } = useConnection();
  const handlePlay = useStarterpackPlayHandler();
  const quantityText = quantity > 1 ? `(${quantity})` : "";

  useEffect(() => {
    if (type === "claimed") return;
    captureAnalyticsEvent(posthog, "purchase_completed", {
      method: "onchain",
    });
  }, [type]);

  return (
    <>
      <HeaderInner
        title={`${type === "claimed" ? "Claim" : "Purchase"} Complete`}
        icon={<CheckIcon />}
      />
      <LayoutContent>
        <Receiving
          title={`You Received ${quantityText}`}
          items={items}
          isLoading={false}
          showPrice={true}
        />
      </LayoutContent>
      <LayoutFooter>
        {transactionHash && (
          <ConfirmingTransaction
            title={`${type === "claimed" ? "Claimed" : "Confirmed"} on Starknet`}
            externalLink={
              getExplorer("starknet", transactionHash, isMainnet)?.url
            }
            isLoading={false}
          />
        )}
        <Button onClick={handlePlay}>Play</Button>
      </LayoutFooter>
    </>
  );
}
