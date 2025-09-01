import { useCallback, useEffect, useState } from "react";
import { client } from "@/utils/graphql";
import {
  MerkleClaimsForAddressDocument,
  MerkleClaimsForAddressQuery,
  MerkleDropNetwork,
} from "@cartridge/ui/utils/api/cartridge";
import { cairo, Call, CallData, hash, num, shortString } from "starknet";
import { useConnection } from "./connection";
import { parseSignature } from "viem";

const FORWARDER_CONTRACT =
  "0x1bee43fc5b696088e7eef7b78d7b2b42e0b88e1e58c93c6d304e35603b582cf";

export interface MerkleClaim {
  network: MerkleDropNetwork;
  data: string[];
  claimed: boolean;
  merkleProof: string[];
  merkleRoot: string;
  contract: string;
  entrypoint: string;
}

export const useMerkleClaim = ({
  key,
  address,
}: {
  key: string;
  address: string;
}) => {
  const { controller, externalSignMessage } = useConnection();
  const [error, setError] = useState<Error | null>(null);
  const [claims, setClaims] = useState<MerkleClaim[]>([]);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!controller) {
      return;
    }

    setIsLoading(true);
    client
      .request<MerkleClaimsForAddressQuery>(MerkleClaimsForAddressDocument, {
        key,
        address,
      })
      .then(async (result) => {
        const claims: MerkleClaim[] = result.merkleClaimsForAddress.map(
          (claim) => ({
            network: claim.merkleDrop.network,
            data: claim.data,
            claimed: claim.claimed,
            merkleProof: claim.merkleProof ?? [],
            merkleRoot: claim.merkleDrop.merkleRoot,
            contract: claim.merkleDrop.contract,
            entrypoint: claim.merkleDrop.entrypoint,
          }),
        );
        setClaims(claims);

        const claim = claims[0];
        const call: Call = {
          contractAddress: FORWARDER_CONTRACT,
          entrypoint: "is_consumed",
          calldata: CallData.compile({
            merkle_tree_key: merkleTreeKey(claim),
            leaf_data: CallData.compile(leafData(address, claim)),
          }),
        };

        const claimResult = await controller.provider.callContract(call);
        setIsClaimed(claimResult[0] === "0x1");
      })
      .catch((error) => {
        setError(error as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key, address, controller]);

  const onSendClaim = useCallback(async () => {
    if (!merkleTreeKey || !leafData || !controller) {
      const error = new Error("Missing required data");
      setError(error);
      throw error;
    }

    try {
      const claim = claims[0];
      const receipient = ["0x0", controller.address()];
      const msg = `Claim on starknet with: ${num.toHex(controller.address())}`;
      const { result, error } = await externalSignMessage(address, msg);

      if (error) {
        throw error;
      }

      const { r, s, v } = parseSignature(result as `0x${string}`);
      const ethSignature = CallData.compile([
        num.toHex(v!),
        cairo.uint256(r),
        cairo.uint256(s),
      ]);
      ethSignature.unshift("0x0");

      const calldata = CallData.compile({
        merkle_tree_key: merkleTreeKey(claim),
        proof: claim.merkleProof,
        leaf_data: CallData.compile(leafData(address, claim)),
        recipient: { ...receipient },
        eth_signature: { ...ethSignature },
      });

      const call: Call = {
        contractAddress: FORWARDER_CONTRACT,
        entrypoint: "verify_and_forward",
        calldata,
      };

      const { transaction_hash } = await controller.executeFromOutsideV3([
        call,
      ]);
      return transaction_hash;
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  }, [address, controller, claims, externalSignMessage]);

  return {
    claims,
    isClaimed,
    isLoading,
    error,
    onSendClaim,
  };
};

const merkleTreeKey = (claim: MerkleClaim) => {
  return {
    chain_id: shortString.encodeShortString(claim.network),
    claim_contract_address: claim.contract,
    selector: hash.getSelectorFromName(claim.entrypoint),
  };
};

const leafData = (address: string, claim: MerkleClaim) => {
  return {
    address: address,
    claim_contract_address: claim.contract,
    selector: hash.getSelectorFromName(claim.entrypoint),
    data: claim.data,
  };
};
