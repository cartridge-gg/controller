import { ErrorAlert } from "@/components/ErrorAlert";
import { useNavigation, usePurchaseContext } from "@/context";
import {
  StarterPack,
  StarterPackItem,
  StarterPackItemType,
} from "@cartridge/controller";
import {
  Button,
  Card,
  CardContent,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  VerifiedIcon,
} from "@cartridge/ui";
import {
  MintAllowance,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";
import { useParams, useSearchParams } from "react-router-dom";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { useEffect, useMemo } from "react";
import { LoadingState } from "../loading";
import { CostBreakdown } from "../review/cost";
import { decodeStarterPack } from "@/utils/starterpack-url";
import { usdcToUsd } from "@/utils/starterpack";
import { useConnection } from "@/hooks/connection";
import { CostDetails } from "../types";

export function PurchaseStarterpack() {
  const { starterpackId } = useParams();
  const [searchParams] = useSearchParams();
  const data = searchParams.get("data");

  const {
    isStarterpackLoading,
    starterpackDetails: details,
    displayError,
    setStarterpack,
  } = usePurchaseContext();

  const { isMainnet } = useConnection();

  useEffect(() => {
    if (!isStarterpackLoading && starterpackId) {
      let starterpack: string | StarterPack = starterpackId;
      if (data) {
        try {
          starterpack = decodeStarterPack(data);
        } catch (error) {
          console.error("Failed to decode starterpack data:", error);
        }
      }
      setStarterpack(starterpack);
    }
  }, [starterpackId, data, isStarterpackLoading, setStarterpack]);

  if (isStarterpackLoading || !details) {
    return <LoadingState />;
  }

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
          ? "ethereum;solana;base;arbitrum;optimism"
          : "arbitrum";

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
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error ? (
          <ErrorAlert title="Error" description={error.message} />
        ) : acquisitionType === StarterpackAcquisitionType.Paid ? (
          <CostBreakdown rails="stripe" costDetails={price} />
        ) : null}
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
      <div className="flex flex-col gap-4">
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
