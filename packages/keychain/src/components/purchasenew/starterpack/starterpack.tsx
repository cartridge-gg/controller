import { ErrorAlert } from "@/components/ErrorAlert";
import {
  useNavigation,
  usePurchaseContext,
  isClaimStarterpack,
  isOnchainStarterpack,
} from "@/context";
import { Item, ItemType } from "@/context/purchase";
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
import { useParams } from "react-router-dom";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { useEffect } from "react";
import { LoadingState } from "../loading";
import { OnchainCostBreakdown } from "../review/cost";
import { useConnection } from "@/hooks/connection";
import { Quote } from "@/types/starterpack-types";

export function PurchaseStarterpack() {
  const { starterpackId } = useParams();

  const {
    isStarterpackLoading,
    starterpackDetails: details,
    displayError,
    setStarterpackId,
  } = usePurchaseContext();

  const { isMainnet } = useConnection();

  useEffect(() => {
    if (!isStarterpackLoading && starterpackId) {
      setStarterpackId(starterpackId);
    }
  }, [starterpackId, isStarterpackLoading, setStarterpackId]);

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

  // Handle backend starterpacks (GraphQL)
  if (isClaimStarterpack(details)) {
    return (
      <ClaimStarterPackInner
        name={details.name}
        starterpackItems={details.items}
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
        isMainnet={isMainnet}
        error={displayError}
      />
    );
  }

  // Fallback (should never reach here with proper types)
  return <LoadingState />;
}

export function ClaimStarterPackInner({
  name,
  edition,
  isVerified,
  supply,
  starterpackItems = [],
  error,
}: {
  name: string;
  edition?: string;
  isVerified?: boolean;
  supply?: number;
  starterpackItems?: Item[];
  error?: Error | null;
}) {
  const { navigate } = useNavigation();

  const onProceed = () => {
    navigate(`/purchase/wallet/starknet;ethereum`);
  };

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
          <StarterpackReceiving starterpackItems={starterpackItems} />
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}
        {!error && (
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
          Check Eligibility
        </Button>
      </LayoutFooter>
    </>
  );
}

export const StarterpackReceiving = ({
  starterpackItems = [],
}: {
  starterpackItems?: Item[];
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between">
        <h1 className="text-xs font-semibold text-foreground-400">
          You receive
        </h1>
      </div>
      <div className="flex flex-col gap-2">
        {starterpackItems.map((item, index) => (
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
  isMainnet,
  error,
}: {
  name: string;
  description: string;
  items: Item[];
  quote?: Quote | null;
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
                  title={item.title}
                  subtitle={item.subtitle}
                  icon={item.icon}
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
