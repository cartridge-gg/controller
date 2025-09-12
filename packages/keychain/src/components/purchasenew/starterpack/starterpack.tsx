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
} from "@cartridge/ui";
import {
  MintAllowance,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { LoadingState } from "../loading";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { decodeStarterPack } from "@/utils/starterpack-url";

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
      error={displayError}
    />
  );
}

export function StarterPackInner({
  name,
  supply,
  mintAllowance,
  acquisitionType,
  starterpackItems = [],
  error,
}: {
  name: string;
  supply?: number;
  mintAllowance?: MintAllowance;
  acquisitionType: StarterpackAcquisitionType;
  starterpackItems?: StarterPackItem[];
  error?: Error | null;
}) {
  const { navigate } = useNavigation();

  const onProceed = () => {
    switch (acquisitionType) {
      case StarterpackAcquisitionType.Paid:
        navigate("/purchase/method/ethereum;solana;base;arbitrum;optimism");
        break;
      case StarterpackAcquisitionType.Claimed:
        navigate(`/purchase/wallet/starknet;ethereum`);
        break;
      default:
        throw new Error(`Invalid acquisition type: ${acquisitionType}`);
    }
  };
  return (
    <>
      <HeaderInner
        title={name}
        right={supply ? <Supply amount={supply} /> : undefined}
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
        {error && <ErrorAlert title="Error" description={error.message} />}
        <Button onClick={onProceed} disabled={!!error}>
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
