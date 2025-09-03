import {
  MerkleDrop,
  StarterItemData,
  StarterItemType,
} from "@/hooks/starterpack";
import {
  Button,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import {
  MintAllowance,
  StarterpackAcquisitionType,
} from "@cartridge/ui/utils/api/cartridge";
import { StarterItem } from "./starter-item";
import { Supply } from "./supply";
import { useParams } from "react-router-dom";
import { useNavigation, usePurchaseContext } from "@/context";
import { useEffect } from "react";
import { ErrorAlert } from "@/components/ErrorAlert";
import { MerkleDrops } from "./merkledrop";
import { LoadingState } from "../loading";

export function PurchaseStarterpack() {
  const { starterpackId } = useParams();

  const {
    isStarterpackLoading,
    starterpackDetails: details,
    displayError,
    setStarterpackId,
  } = usePurchaseContext();

  useEffect(() => {
    if (!isStarterpackLoading && starterpackId) {
      setStarterpackId(starterpackId);
    }
  }, [starterpackId, isStarterpackLoading, setStarterpackId]);

  if (isStarterpackLoading || !details) {
    return <LoadingState />;
  }

  return (
    <StarterPackInner
      name={details.name}
      supply={details.supply}
      mintAllowance={details.mintAllowance}
      merkleDrops={details.merkleDrops}
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
  merkleDrops = [],
  starterpackItems = [],
  error,
}: {
  name: string;
  supply?: number;
  mintAllowance?: MintAllowance;
  merkleDrops?: MerkleDrop[];
  acquisitionType: StarterpackAcquisitionType;
  starterpackItems?: StarterItemData[];
  error?: Error | null;
}) {
  const { navigate } = useNavigation();

  const onProceed = () => {
    switch (acquisitionType) {
      case StarterpackAcquisitionType.Paid:
        navigate("/purchase/method/ethereum;solana;base;arbitrum;optimism");
        break;
      case StarterpackAcquisitionType.Claimed:
        // claim will always be against mainnet for now
        navigate("/purchase/wallet/starknet;ethereum/true");
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
                .filter((item) => item.type === StarterItemType.NFT)
                .map((item, index) => (
                  <StarterItem key={index} {...item} />
                ))}
              {starterpackItems
                .filter((item) => item.type === StarterItemType.CREDIT)
                .map((item, index) => (
                  <StarterItem key={index} {...item} />
                ))}
            </div>
          </div>
          {acquisitionType === StarterpackAcquisitionType.Claimed && (
            <MerkleDrops merkleDrops={merkleDrops} />
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
