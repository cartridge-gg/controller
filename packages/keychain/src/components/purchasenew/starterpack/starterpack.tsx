import { ErrorAlert } from "@/components/ErrorAlert";
import {
  useNavigation,
  usePurchaseContext,
} from "@/context";
import { ItemType } from "@/context/purchase";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Spinner,
  Card,
  CardContent,
} from "@cartridge/ui";
import { useParams } from "react-router-dom";
import { StarterItem } from "./starter-item";
import { useEffect } from "react";
import { LoadingState } from "../loading";
import { OnchainCostBreakdown } from "../review/cost";
import { useConnection } from "@/hooks/connection";

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

  if (isStarterpackLoading) {
    return <LoadingState />;
  }

  if (!details && displayError) {
    return (
      <>
        <HeaderInner
          title="Starterpack Error"
          description={
            <span className="text-foreground-200 text-xs font-normal">
              Unable to load starterpack
            </span>
          }
          hideIcon
        />
        <LayoutContent />
        <LayoutFooter>
          <ErrorAlert title="Error" description={displayError.message} />
        </LayoutFooter>
      </>
    );
  }

  // If no details and no error, keep showing loading (shouldn't happen)
  if (!details) {
    return <LoadingState />;
  }

  // All starterpacks are onchain now
  return (
    <OnchainStarterPackInner
      name={details.name}
      description={details.description}
      items={details.items}
      quote={details.quote}
      isMainnet={isMainnet}
      error={displayError}
    />
  );
}

/**
 * Onchain StarterPack Component - for starterpacks registered on smart contracts
 */
export function OnchainStarterPackInner({
  name,
  description,
  items,
  quote,
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
  isMainnet?: boolean;
  error?: Error | null;
}) {
  const { navigate } = useNavigation();

  const onProceed = () => {
    // Onchain starterpacks always use crypto payment (direct to contract)
    const methods = isMainnet ? "ethereum;base;arbitrum;optimism" : "starknet";
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
                <StarterItem
                  key={index}
                  type={ItemType.NFT}
                  title={item.name}
                  subtitle={item.description}
                  icon={item.imageUri}
                  showPrice={false}
                />
              ))}
            </div>
          </div>
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error ? (
          <ErrorAlert title="Error" description={error.message} />
        ) : quote ? (
          <OnchainCostBreakdown quote={quote} />
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
