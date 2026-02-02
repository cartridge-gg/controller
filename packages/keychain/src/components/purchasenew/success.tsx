import {
  Button,
  CheckIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "./receiving";
import { useConnection } from "@/hooks/connection";
import {
  useStarterpackContext,
  useOnchainPurchaseContext,
  Item,
} from "@/context";
import { useMemo } from "react";
import { ConfirmingTransaction } from "./pending";
import { getExplorer } from "@/hooks/starterpack/layerswap";
import { StarterpackType } from "@/context";
import { useStarterpackPlayHandler } from "@/hooks/starterpack";

export function Success() {
  const { starterpackDetails, transactionHash, claimItems } =
    useStarterpackContext();
  const { purchaseItems } = useOnchainPurchaseContext();

  const items = useMemo(() => {
    if (starterpackDetails?.type === "claimed") {
      return claimItems;
    }

    return purchaseItems;
  }, [starterpackDetails, claimItems, purchaseItems]);

  return (
    <PurchaseSuccessInner
      items={items}
      type={starterpackDetails!.type}
      transactionHash={transactionHash}
    />
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
