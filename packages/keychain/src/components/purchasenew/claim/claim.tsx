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
import { useCallback, useMemo, useState } from "react";
import { Badge } from "../starterpack/badge";
import { useParams } from "react-router-dom";
import { useMerkleClaim } from "@/hooks/merkle-claim";
import { LoadingState } from "../loading";
import { PurchaseType } from "@/hooks/payments/crypto";
import { PurchaseItem, PurchaseItemType, usePurchaseContext } from "@/context/purchase";
import { useConnection } from "@/hooks/connection";
import { CallData, Call, num, cairo, hash, shortString } from "starknet";
import { MerkleDropNetwork } from "@cartridge/ui/utils/api/cartridge";
import { parseSignature } from "viem";
import { ErrorAlert } from "@/components/ErrorAlert";

export function Claim() {
  const { key, address: externalAddress } = useParams();
  const { goBack } = useNavigation();
  const { controller, externalSignMessage } = useConnection();
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { claims, isLoading } = useMerkleClaim({
    key: key!,
    address: externalAddress!,
  });


  const items = useMemo(()=> {
    return claims.map((claim) => ({
      title: claim.data[0],
      type: PurchaseItemType.NFT,
      icon: <GiftIcon variant="solid" />,
    }));
  }, [claims])

  const onConfirm = useCallback(async () => {
    if (!controller) {
      return;
    }

    try {
      setIsClaiming(true);
      setError(null);
      const claim = claims[0];
      let receipient = ["0x0", controller.address()];
      let ethSignature: string[] = ["0x1"];
      let leafData: string[] = [];
  
      if (claim.network === MerkleDropNetwork.Ethereum) {
        const msg = `Claim on starknet with: ${num.toHex(controller.address())}`;
        const {result, error} = await externalSignMessage(externalAddress!, msg);
        if (error) {
          throw new Error(error);
        }

        const { r, s, v } = parseSignature(result as `0x${string}`);
        ethSignature = CallData.compile([
          num.toHex(v!),
          cairo.uint256(r),
          cairo.uint256(s),
        ]);
        ethSignature.unshift("0x0"); 

        leafData = CallData.compile({
          address: externalAddress!,
          claim_contract_address: claim.contract,
          selector: hash.getSelectorFromName(claim.entrypoint),
          data: claim.data,
        });
      }

      const calldata = CallData.compile({
        merkle_tree_key: {
          chain_id: shortString.encodeShortString(claim.network), // ETHEREUM
          claim_contract_address: claim.contract,
          selector: hash.getSelectorFromName(claim.entrypoint)

        },
        proof: claim.merkleProof,
        leaf_data: leafData,
        recipient: {...receipient},
        eth_signature: {...ethSignature},
      })

      const call: Call = {
        contractAddress: "0xb12abd89a802f600ae266d62ebc5bf3a7b196c61a1abcbbdac49f57ece489e",
        entrypoint: "verify_and_forward",
        calldata,
      };      

      const result = await controller.executeFromOutsideV3([call]);
      console.log({result});
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsClaiming(false);
    }
  }, [claims, externalAddress]);

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
        {error && <ErrorAlert title="Error" description={error.message} />}
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
        {claims.length === 0 ? (
          <Button onClick={() => goBack()}>Check Another Wallet</Button>
        ) : (
          <Button onClick={onConfirm} isLoading={isClaiming}>Claim</Button>
        )}
      </LayoutFooter>
    </>
  );
}

