import { useNavigation } from "@/context";
import {
  Button,
  CardContent,
  Empty,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Skeleton,
} from "@cartridge/ui";
import { Receiving } from "../receiving";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "../starterpack/badge";
import { useParams } from "react-router-dom";
import { useMerkleClaim } from "@/hooks/merkle-claim";
import { ItemType, usePurchaseContext } from "@/context/purchase";
import { useConnection } from "@/hooks/connection";
import { CallData, Call, num, cairo, hash, shortString } from "starknet";
import { MerkleDropNetwork } from "@cartridge/ui/utils/api/cartridge";
import { parseSignature } from "viem";
import { ErrorAlert } from "@/components/ErrorAlert";

const FORWARDER_CONTRACT =
  "0x1bee43fc5b696088e7eef7b78d7b2b42e0b88e1e58c93c6d304e35603b582cf";

export function Claim() {
  const { key, address: externalAddress } = useParams();
  const { goBack, navigate } = useNavigation();
  const { controller, externalSignMessage } = useConnection();
  const { claimItems, setClaimItems, onClaim } = usePurchaseContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { claims, isLoading: isLoadingClaims } = useMerkleClaim({
    key: key!,
    address: externalAddress!,
  });

  const merkleTreeKey = useMemo(() => {
    if (claims.length === 0) {
      return null;
    }

    return {
      chain_id: shortString.encodeShortString(claims[0].network),
      claim_contract_address: claims[0].contract,
      selector: hash.getSelectorFromName(claims[0].entrypoint),
    };
  }, [claims]);

  useEffect(() => {
    if (claims.length === 0) {
      return;
    }

    setClaimItems(
      claims[0].data.map((data) => ({
        title: data,
        type: ItemType.NFT,
        icon: <GiftIcon variant="solid" />,
      })),
    );
  }, [claims, setClaimItems]);

  const leafDataCompiled = useMemo(() => {
    if (claims.length === 0) {
      return null;
    }

    return CallData.compile({
      address: externalAddress!,
      claim_contract_address: claims[0].contract,
      selector: hash.getSelectorFromName(claims[0].entrypoint),
      data: claims[0].data,
    });
  }, [claims, externalAddress]);

  useEffect(() => {
    if (!merkleTreeKey || !leafDataCompiled || !controller) {
      return;
    }

    const call: Call = {
      contractAddress: FORWARDER_CONTRACT,
      entrypoint: "is_consumed",
      calldata: CallData.compile({
        merkle_tree_key: merkleTreeKey,
        leaf_data: leafDataCompiled,
      }),
    };

    setIsLoading(true);
    controller.provider
      .callContract(call)
      .then((result) => {
        setIsClaimed(result[0] === "0x1");
      })
      .catch((error) => {
        console.error(error);
        setError(error as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [merkleTreeKey, leafDataCompiled, controller]);

  const onConfirm = useCallback(async () => {
    if (!controller || !merkleTreeKey || !leafDataCompiled) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const claim = claims[0];
      const receipient = ["0x0", controller.address()];
      let ethSignature: string[] = ["0x1"];

      if (claim.network === MerkleDropNetwork.Ethereum) {
        const msg = `Claim on starknet with: ${num.toHex(controller.address())}`;
        const { result, error } = await externalSignMessage(
          externalAddress!,
          msg,
        );
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
      }

      const calldata = CallData.compile({
        merkle_tree_key: {
          chain_id: shortString.encodeShortString(claim.network),
          claim_contract_address: claim.contract,
          selector: hash.getSelectorFromName(claim.entrypoint),
        },
        proof: claim.merkleProof,
        leaf_data: leafDataCompiled,
        recipient: { ...receipient },
        eth_signature: { ...ethSignature },
      });

      const call: Call = {
        contractAddress: FORWARDER_CONTRACT,
        entrypoint: "verify_and_forward",
        calldata,
      };

      await onClaim(call);
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [
    claims,
    externalAddress,
    merkleTreeKey,
    leafDataCompiled,
    controller,
    externalSignMessage,
  ]);

  if (isLoadingClaims) {
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
          <Receiving title="Receiving" items={claimItems} showTotal />
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
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isClaimed}
          >
            {isClaimed ? "Already Claimed" : "Claim"}
          </Button>
        )}
      </LayoutFooter>
    </>
  );
}

export const LoadingState = () => {
  return (
    <LayoutContent>
      <Skeleton className="min-h-10 w-full rounded" />
      <Skeleton className="min-h-10 w-full rounded" />
      <Skeleton className="min-h-[180px] w-full rounded" />
      <Skeleton className="min-h-[180px] w-full rounded" />
    </LayoutContent>
  );
};
