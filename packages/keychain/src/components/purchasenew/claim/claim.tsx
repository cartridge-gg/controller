import { useNavigation } from "@/context";
import {
  Button,
  CardContent,
  Empty,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
} from "@cartridge/ui";
import { Receiving } from "../receiving";
import { useCallback, useMemo } from "react";
import { Call } from "@starknet-io/types-js";
import { Badge } from "../starterpack/badge";
import { useParams } from "react-router-dom";
import { useMerkleClaim } from "@/hooks/merkle-claim";
import { LoadingState } from "../loading";
import { PurchaseType } from "@/hooks/payments/crypto";
import { PurchaseItem, PurchaseItemType } from "@/context/purchase";

export function Claim() {
  const { key, address } = useParams();
  const { goBack } = useNavigation();
  const { claims, error: claimError, isLoading } = useMerkleClaim({
    key: key!,
    address: address!,
  });


  const items = useMemo(()=> {
    return claims.map((claim) => ({
      title: claim.data[0],
      type: PurchaseItemType.NFT,
      icon: <GiftIcon variant="solid" />,
    }));
  }, [claims])

  const onConfirm = useCallback(async () => {
    if (claims.length === 0) {
      goBack();
      return;
    }

    // const call: Call = {
    //   contract_address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    //   entry_point: "transfer",
    //   calldata: [
    //     "0x00dBD8a366Db7Af2aBC9AA5B72C9E357d0Ff83dfba2FE5B63CC7FfB5Cd0Df2Cd",
    //     "0x0",
    //     "0x1",
    //   ],
    // };
    // const txn = await externalSendTransaction(selectedWallet.type, [call]);
    // console.log({ txn });
  }, [claims]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <HeaderInner
        title="Claim Starterpack"
        icon={<GiftIcon variant="solid" />}
      />
      <LayoutContent>
        {claims.length === 0 ? (
          <Empty
            icon="inventory"
            title="Nothing to Claim from this Wallet"
            className="h-full md:h-[420px]"
          />
        ) : (
          <Receiving title="Receiving" items={items} showTotal />
        )}
      </LayoutContent>
      <LayoutFooter>
        {claims.length > 0 && (
          <CardContent className="relative flex flex-col gap-2 border border-background-200 bg-[#181C19] rounded-[4px] text-xs text-foreground-400">
            <div className="absolute -top-1 right-4">
              <Badge price={0} />
            </div>
            <div className="text-foreground-400 font-medium text-sm flex flex-row items-center gap-1">
              Network Fees
            </div>
          </CardContent>
        )}
        <Button onClick={onConfirm}>
          {claims.length === 0 ? "Check Another Wallet" : "Claim"}
        </Button>
      </LayoutFooter>
    </>
  );
}

