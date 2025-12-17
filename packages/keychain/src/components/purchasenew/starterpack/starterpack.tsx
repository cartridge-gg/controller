import { ErrorAlert } from "@/components/ErrorAlert";
import {
  useNavigation,
  useStarterpackContext,
  useOnchainPurchaseContext,
  isClaimStarterpack,
  isOnchainStarterpack,
  Item,
} from "@/context";
import {
  Button,
  Card,
  CardContent,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  VerifiedIcon,
  PlusIcon,
  MinusIcon,
  Thumbnail,
  ListIcon,
  ErrorAlertIcon,
} from "@cartridge/ui";
import { useParams, useSearchParams } from "react-router-dom";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { useEffect, useMemo } from "react";
import { LoadingState } from "../loading";
import { OnchainCostBreakdown } from "../review/cost";
import { Quote } from "@/context";
import { Receiving } from "../receiving";
import { getWallet } from "../wallet/config";
import { num } from "starknet";

export function PurchaseStarterpack() {
  const { starterpackId } = useParams();
  const [searchParams] = useSearchParams();
  const preimage = searchParams.get("preimage");
  const { navigate } = useNavigation();

  const {
    isStarterpackLoading,
    starterpackDetails: details,
    displayError,
    setStarterpackId,
  } = useStarterpackContext();

  useEffect(() => {
    if (!isStarterpackLoading && starterpackId) {
      setStarterpackId(starterpackId);
    }
  }, [starterpackId, isStarterpackLoading, setStarterpackId]);

  // Auto-redirect to claim page if preimage is available
  useEffect(() => {
    if (
      !isStarterpackLoading &&
      isClaimStarterpack(details) &&
      preimage &&
      details.merkleDrops?.some((drop) => drop.network === "ETHEREUM") &&
      !displayError
    ) {
      const keys = details.merkleDrops
        .filter((drop) => drop.network === "ETHEREUM")
        .map((drop) => drop.key)
        .join(";");

      navigate(`/purchase/claim/${keys}/${preimage}/preimage`, {
        replace: true,
      });
    }

    // TEMP: Short circuit to checkout if onchain starterpack
    if (
      !isStarterpackLoading &&
      isOnchainStarterpack(details) &&
      !displayError
    ) {
      navigate(`/purchase/checkout/onchain`, { replace: true });
    }
  }, [isStarterpackLoading, details, preimage, displayError, navigate]);

  if (
    (isStarterpackLoading || isOnchainStarterpack(details) || preimage) &&
    !displayError
  ) {
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

  if (isClaimStarterpack(details)) {
    return (
      <ClaimStarterPackInner
        name={details.name}
        starterpackItems={details.items}
        error={displayError}
      />
    );
  }

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
  icon,
  items,
  quote,
  error,
}: {
  name: string;
  description: string;
  icon: string;
  items: Item[];
  quote?: Quote | null;
  error?: Error | null;
}) {
  const { navigate } = useNavigation();
  const {
    selectedWallet,
    quantity,
    incrementQuantity,
    decrementQuantity,
    selectedToken,
    conversionError,
    isFetchingConversion,
  } = useOnchainPurchaseContext();
  const wallet = getWallet(selectedWallet?.type || "controller");

  // Check if we need token conversion (selected token differs from payment token)
  const needsConversion = useMemo(() => {
    if (!quote || !selectedToken) return false;
    return num.toHex(selectedToken.address) !== num.toHex(quote.paymentToken);
  }, [quote, selectedToken]);

  const disableActions = useMemo(() => {
    return (
      !!error ||
      !quote ||
      (!!conversionError && needsConversion) ||
      isFetchingConversion
    );
  }, [error, quote, conversionError, needsConversion, isFetchingConversion]);

  const onWalletSelect = () => {
    if (disableActions) return;
    const methods = "starknet;ethereum;base;arbitrum;optimism";
    navigate(`/purchase/wallet/${methods}`);
  };

  const onProceed = () => {
    if (disableActions) return;
    navigate(`/purchase/checkout/onchain`);
  };

  return (
    <>
      <HeaderInner
        title={name}
        icon={<Thumbnail icon={icon} rounded={false} />}
        hideIcon
      />
      <LayoutContent>
        <div className="flex flex-col gap-3">
          <div className="flex border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-300 p-2">
            {description}
          </div>
          <Receiving title="Includes" items={items} />
        </div>
      </LayoutContent>
      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}

        {/* Insufficient Liquidity Warning - only show if we need conversion */}
        {conversionError && needsConversion && (
          <Card className="border-error">
            <CardContent className="flex flex-row items-center gap-3 p-3 text-error">
              <ErrorAlertIcon variant="error" size="sm" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">Insufficient Liquidity</p>
                <p className="text-xs text-foreground-300">
                  Unable to swap to {selectedToken?.symbol}. Try selecting a
                  different token.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div
          className={`flex justify-between border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-300 p-2 transition-colors ${
            !disableActions ? "cursor-pointer hover:bg-background-200" : ""
          }`}
          onClick={onWalletSelect}
        >
          <div className="flex gap-2">
            {wallet.subIcon} Purchase with {wallet.name}
          </div>
          <ListIcon size="xs" variant="solid" />
        </div>
        {quote && <OnchainCostBreakdown quote={quote} />}
        <div className="flex flex-row gap-3">
          <Button
            variant="secondary"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || disableActions}
          >
            <MinusIcon size="xs" />
          </Button>
          <Button
            variant="secondary"
            onClick={incrementQuantity}
            disabled={disableActions}
          >
            <PlusIcon size="xs" variant="solid" />
          </Button>
          <Button
            className="w-full"
            onClick={onProceed}
            disabled={disableActions}
          >
            Buy {quantity}
          </Button>
        </div>
      </LayoutFooter>
    </>
  );
}
