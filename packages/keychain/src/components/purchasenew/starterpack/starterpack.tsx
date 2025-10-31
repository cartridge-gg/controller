import { ErrorAlert } from "@/components/ErrorAlert";
import {
  useNavigation,
  usePurchaseContext,
  isBackendStarterpack,
  isOnchainStarterpack,
} from "@/context";
import { StarterPackItem, StarterPackItemType } from "@cartridge/controller";
import {
  Button,
  Card,
  CardContent,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  VerifiedIcon,
  Spinner,
} from "@cartridge/ui";
import {
  MintAllowance,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";
import { useParams } from "react-router-dom";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { useEffect, useMemo } from "react";
import { LoadingState } from "../loading";
import { CostBreakdown, OnchainCostBreakdown } from "../review/cost";
import { usdcToUsd } from "@/utils/starterpack";
import { useConnection } from "@/hooks/connection";
import { CostDetails } from "../types";

export function PurchaseStarterpack() {
  const { starterpackId } = useParams();

  const {
    isStarterpackLoading,
    starterpackDetails: details,
    displayError,
    setStarterpack,
  } = usePurchaseContext();

  const { isMainnet } = useConnection();

  useEffect(() => {
    if (!isStarterpackLoading && starterpackId) {
      setStarterpack(starterpackId);
    }
  }, [starterpackId, isStarterpackLoading, setStarterpack]);

  if (isStarterpackLoading || !details) {
    return <LoadingState />;
  }

  // Handle backend starterpacks (GraphQL)
  if (isBackendStarterpack(details)) {
    return (
      <StarterPackInner
        name={details.name}
        supply={details.supply}
        mintAllowance={details.mintAllowance}
        acquisitionType={details.acquisitionType}
        starterpackItems={details.starterPackItems}
        isMainnet={isMainnet}
        error={displayError}
      />
    );
  }

  // Handle onchain starterpacks (Smart contract)
  if (isOnchainStarterpack(details)) {
    return (
      <OnchainStarterPackInner
        name={details.name}
        description={details.description}
        items={details.items}
        quote={details.quote}
        isQuoteLoading={details.isQuoteLoading}
        isMainnet={isMainnet}
        error={displayError}
      />
    );
  }

  // Fallback (should never reach here with proper types)
  return <LoadingState />;
}

export function StarterPackInner({
  name,
  edition,
  isVerified,
  isMainnet,
  supply,
  mintAllowance,
  acquisitionType,
  starterpackItems = [],
  error,
}: {
  name: string;
  edition?: string;
  isVerified?: boolean;
  isMainnet?: boolean;
  supply?: number;
  mintAllowance?: MintAllowance;
  acquisitionType: StarterpackAcquisitionType;
  starterpackItems?: StarterPackItem[];
  error?: Error | null;
}) {
  const { navigate } = useNavigation();

  const onProceed = () => {
    switch (acquisitionType) {
      case StarterpackAcquisitionType.Paid: {
        const methods = isMainnet
          ? "ethereum;base;arbitrum;optimism"
          : "arbitrum;";

        navigate(`/purchase/method/${methods}`);
        break;
      }
      case StarterpackAcquisitionType.Claimed:
        navigate(`/purchase/wallet/starknet;ethereum`);
        break;
      default:
        throw new Error(`Invalid acquisition type: ${acquisitionType}`);
    }
  };

  const price = useMemo(() => {
    const totalUsdc = starterpackItems.reduce(
      (acc, item) => acc + (item.price || 0n),
      0n,
    );
    const total = usdcToUsd(totalUsdc);

    return {
      baseCostInCents: total * 100,
      processingFeeInCents: 0,
      totalInCents: total * 100,
    } as CostDetails;
  }, [starterpackItems]);

  return (
    <>
      <HeaderInner
        title={name}
        description={
          edition ? (
            <span className="text-foreground-200 text-xs font-normal flex items-center gap-1 leading-none">
              {isVerified && <VerifiedIcon size="xs" />}
              {edition}
            </span>
          ) : undefined
        }
        right={supply !== undefined ? <Supply amount={supply} /> : undefined}
        hideIcon
      />
      <LayoutContent>
        <div className="flex flex-col gap-3">
          <StarterpackReceiving
            mintAllowance={mintAllowance}
            starterpackItems={starterpackItems}
          />
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error ? (
          <ErrorAlert title="Error" description={error.message} />
        ) : acquisitionType === StarterpackAcquisitionType.Paid ? (
          <CostBreakdown rails="stripe" costDetails={price} />
        ) : null}
        {acquisitionType === StarterpackAcquisitionType.Claimed && !error && (
          <Card>
            <CardContent
              className="flex flex-row justify-center items-center text-foreground-300 text-sm cursor-pointer h-[40px]"
              onClick={() => navigate("/purchase/starterpack/collections")}
            >
              View Eligible Collections
            </CardContent>
          </Card>
        )}
        <Button onClick={onProceed} disabled={!!error || supply === 0}>
          {acquisitionType === StarterpackAcquisitionType.Paid
            ? "Purchase"
            : "Check Eligibility"}
        </Button>
      </LayoutFooter>
    </>
  );
}

export const StarterpackReceiving = ({
  mintAllowance,
  starterpackItems = [],
}: {
  mintAllowance?: MintAllowance;
  starterpackItems?: StarterPackItem[];
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between">
        <h1 className="text-xs font-semibold text-foreground-400">
          You receive
        </h1>
        {mintAllowance && (
          <h1 className="text-xs font-semibold text-foreground-400">
            Mints Remaining: {mintAllowance.limit - mintAllowance.count} /{" "}
            {mintAllowance.limit}
          </h1>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {starterpackItems
          .filter((item) => item.type === StarterPackItemType.NONFUNGIBLE)
          .map((item, index) => (
            <StarterItem key={index} {...item} />
          ))}
        {starterpackItems
          .filter((item) => item.type === StarterPackItemType.FUNGIBLE)
          .map((item, index) => (
            <StarterItem key={index} {...item} />
          ))}
      </div>
    </div>
  );
};

/**
 * Onchain StarterPack Component - for starterpacks registered on smart contracts
 */
export function OnchainStarterPackInner({
  name,
  description,
  items,
  quote,
  isQuoteLoading,
  isMainnet,
  error,
}: {
  name: string;
  description: string;
  items: Array<{ name: string; description: string; imageUri: string }>;
  quote?: {
    basePrice: bigint;
    referralFee: bigint;
    protocolFee: bigint;
    totalCost: bigint;
    paymentToken: string;
    paymentTokenMetadata: {
      symbol: string;
      decimals: number;
    };
  } | null;
  isQuoteLoading?: boolean;
  isMainnet?: boolean;
  error?: Error | null;
}) {
  const { navigate } = useNavigation();

  const onProceed = () => {
    // Onchain starterpacks always use crypto payment (direct to contract)
    const methods = isMainnet
      ? "ethereum;base;arbitrum;optimism"
      : "starknet;arbitrum";
    navigate(`/purchase/method/${methods}`);
  };

  return (
    <>
      <HeaderInner
        title={name}
        description={
          <span className="text-foreground-200 text-xs font-normal">
            {description}
          </span>
        }
        hideIcon
      />
      <LayoutContent>
        <div className="flex flex-col gap-3">
          {/* Onchain Items Display */}
          <div className="flex flex-col gap-2">
            <h1 className="text-xs font-semibold text-foreground-400">
              You receive
            </h1>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="flex flex-row items-center gap-3 p-3">
                    {item.imageUri && (
                      <img
                        src={item.imageUri}
                        alt={item.name}
                        className="w-12 h-12 rounded"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-foreground-300">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error ? (
          <ErrorAlert title="Error" description={error.message} />
        ) : quote ? (
          <OnchainCostBreakdown quote={quote} isQuoteLoading={isQuoteLoading} />
        ) : (
          <Card className="gap-3">
            <div className="flex flex-row gap-3 h-[40px]">
              <CardContent className="flex items-center border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400 w-full">
                <div className="flex justify-between text-sm font-medium w-full">
                  <span>Total</span>
                  <Spinner />
                </div>
              </CardContent>
            </div>
          </Card>
        )}
        <Button onClick={onProceed} disabled={!!error || !quote}>
          Purchase
        </Button>
      </LayoutFooter>
    </>
  );
}
