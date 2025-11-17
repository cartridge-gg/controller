import { useCallback, useEffect, useState, useRef } from "react";
import { client } from "@/utils/graphql";
import {
  MerkleClaimsForAddressDocument,
  MerkleClaimsForAddressQuery,
  MerkleDropNetwork,
} from "@cartridge/ui/utils/api/cartridge";
import {
  cairo,
  Call,
  Calldata,
  CallData,
  hash,
  num,
  shortString,
  TypedData,
} from "starknet";
import { useConnection } from "./connection";
import { parseSignature } from "viem";
import { ExternalPlatform, ExternalWalletType } from "@cartridge/controller";
import { evmNetworks } from "@/components/purchasenew/wallet/config";
import { signMessageWithPrivateKey } from "@/utils/eth-signing";

export interface MerkleClaim {
  key: string;
  network: MerkleDropNetwork;
  salt: string;
  index: number;
  data: string[];
  claimed: boolean;
  loading: boolean;
  merkleProof: string[];
  merkleRoot: string;
  contract: string;
  entrypoint: string;
  description?: string | null;
  matchStarterpackItem?: boolean | null;
}

export const useMerkleClaim = ({
  keys,
  address,
  type,
  preimage,
}: {
  keys: string;
  address?: string;
  type: ExternalWalletType | "controller" | "preimage";
  preimage?: string;
}) => {
  const { controller, isMainnet, externalSignMessage, externalSignTypedData } =
    useConnection();
  const [error, setError] = useState<Error | null>(null);
  const [claims, setClaims] = useState<MerkleClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const checkedClaimsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!address) {
      return;
    }

    setIsLoading(true);
    client
      .request<MerkleClaimsForAddressQuery>(MerkleClaimsForAddressDocument, {
        keys: keys.split(";"),
        address,
      })
      .then(async (result) => {
        const claims: MerkleClaim[] = result.merkleClaimsForAddress.map(
          (claim) => ({
            key: claim.merkleDrop.key,
            network: claim.merkleDrop.network,
            data: claim.data,
            index: claim.index,
            salt: claim.merkleDrop.salt,
            merkleProof: claim.merkleProof ?? [],
            merkleRoot: claim.merkleDrop.merkleRoot,
            contract: claim.merkleDrop.contract,
            entrypoint: claim.merkleDrop.entrypoint,
            description: claim.merkleDrop.description,
            matchStarterpackItem: claim.merkleDrop.matchStarterpackItem,
            claimed: false,
            loading: true,
          }),
        );
        setClaims(claims);
        // Reset checked claims when new claims are loaded
        checkedClaimsRef.current = new Set();
      })
      .catch((error) => {
        setError(error as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [keys, address]);

  const checkAllClaims = useCallback(
    async (claimsToCheck: MerkleClaim[]) => {
      if (claimsToCheck.length === 0 || !controller || !address) {
        return;
      }

      const updatedClaims = await Promise.all(
        claimsToCheck.map(async (claim) => {
          try {
            // https://github.com/cartridge-gg/merkle_drop/blob/main/src/types/leaf.cairo
            let leafHash = hash.computePoseidonHashOnElements(
              CallData.compile(leafData(address, claim)),
            );
            leafHash = hash.computePedersenHash(0, leafHash);
            leafHash = hash.computePedersenHash(leafHash, 1);
            leafHash = hash.computePedersenHash(0, leafHash);

            const call: Call = {
              contractAddress: import.meta.env.VITE_MERKLE_DROP_CONTRACT,
              entrypoint: "is_consumed",
              calldata: CallData.compile({
                merkle_tree_key: merkleTreeKey(claim),
                leaf_hash: leafHash,
              }),
            };

            const result = await controller.provider.callContract(call);
            return {
              ...claim,
              claimed: result[0] === "0x1",
              loading: false,
            };
          } catch (error) {
            setError(error as Error);
            console.error("Error checking claim:", error);
            return {
              ...claim,
              loading: false,
            };
          }
        }),
      );

      setClaims(updatedClaims);
    },
    [controller, address],
  );

  useEffect(() => {
    if (claims.length === 0 || !controller) {
      return;
    }

    // Create a unique key for the current set of claims
    const claimsKey = claims
      .map((claim) => `${claim.key}-${claim.salt}`)
      .sort()
      .join("|");

    // Only check if we haven't checked this exact set of claims before
    if (!checkedClaimsRef.current.has(claimsKey)) {
      checkedClaimsRef.current.add(claimsKey);
      checkAllClaims(claims);
    }
  }, [claims, controller, checkAllClaims]);

  // TODO: Use ABI to generate the calldata
  const onSendClaim = useCallback(
    async (claimIndices?: number[]) => {
      if (
        !merkleTreeKey ||
        !leafData ||
        !controller ||
        !claims.length ||
        !address
      ) {
        const error = new Error("Missing required data");
        setError(error);
        throw error;
      }

      try {
        // Filter claims based on provided indices, or use all unclaimed
        const claimsToProcess = claimIndices
          ? claims.filter((_, index) => claimIndices.includes(index))
          : claims.filter((claim) => !claim.claimed);

        if (claimsToProcess.length === 0) {
          throw new Error("No claims to process");
        }

        // Verify all claims are homogeneously EVM or non-EVM
        const claimTypes = claimsToProcess.map((claim) =>
          evmNetworks.includes(claim.network.toLowerCase() as ExternalPlatform),
        );
        const isEvm = claimTypes[0];

        if (!claimTypes.every((type) => type === isEvm)) {
          throw new Error("Cannot mix EVM and non-EVM claims");
        }

        let signature: Calldata;
        if (isEvm) {
          const msg = evmMessage(controller.address());

          let signatureResult: string;

          // Use preimage signing if available, otherwise use external wallet
          if (preimage) {
            signatureResult = await signMessageWithPrivateKey(msg, preimage);
          } else {
            const { result, error } = await externalSignMessage(address, msg);
            if (error) {
              throw new Error(error);
            }
            signatureResult = result as `0x${string}`;
          }

          const { r, s, v } = parseSignature(signatureResult as `0x${string}`);
          signature = CallData.compile([
            num.toHex(v!),
            cairo.uint256(r),
            cairo.uint256(s),
          ]);

          signature.unshift("0x0"); // Enum Ethereum Signature
        } else {
          if (preimage) {
            throw new Error(
              "Ethereum preimage is not supported for Starknet claims",
            );
          }
          const msg: TypedData = starknetMessage(
            controller.address(),
            isMainnet,
          );
          if (type === "controller") {
            const result = await controller.signMessage(msg);
            signature = result as Array<string>;
          } else {
            const { result, error } = await externalSignTypedData(type, msg);
            if (error) {
              throw new Error(error);
            }
            signature = result as Array<string>;
          }

          signature.unshift(num.toHex(signature.length));
          signature.unshift("0x1"); // Enum Starknet Signature
        }

        const calls = claimsToProcess.map((claim) => {
          const raw = {
            merkle_tree_key: merkleTreeKey(claim),
            proof: claim.merkleProof,
            leaf_data: CallData.compile(leafData(address, claim)),
            recipient: controller.address(),
            signature: { ...signature },
          };

          return {
            contractAddress: import.meta.env.VITE_MERKLE_DROP_CONTRACT,
            entrypoint: "verify_and_forward",
            calldata: CallData.compile(raw),
          };
        });

        const { transaction_hash } =
          await controller.executeFromOutsideV3(calls);
        return transaction_hash;
      } catch (error) {
        setError(error as Error);
        throw error;
      }
    },
    [
      type,
      address,
      controller,
      claims,
      isMainnet,
      externalSignMessage,
      externalSignTypedData,
      preimage,
    ],
  );

  return {
    claims,
    isLoading,
    error,
    onSendClaim,
  };
};

const merkleTreeKey = (claim: MerkleClaim) => {
  // Merkle Drop contract treats all EVM networks as Ethereum
  let network: MerkleDropNetwork = claim.network;
  if (evmNetworks.includes(network.toLowerCase() as ExternalPlatform)) {
    network = MerkleDropNetwork.Ethereum;
  }

  return {
    chain_id: shortString.encodeShortString(network),
    claim_contract_address: claim.contract,
    selector: hash.getSelectorFromName(claim.entrypoint),
    salt: claim.salt,
  };
};

const leafData = (address: string, claim: MerkleClaim) => {
  return {
    address: address,
    index: claim.index,
    claim_contract_address: claim.contract,
    selector: hash.getSelectorFromName(claim.entrypoint),
    data: claim.data,
  };
};

const evmMessage = (address: string): string => {
  return `Claim on starknet with: ${num.toHex(address)}`;
};

const starknetMessage = (address: string, isMainnet: boolean): TypedData => {
  return {
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Claim: [{ name: "recipient", type: "ContractAddress" }],
    },
    primaryType: "Claim",
    domain: {
      name: "Merkle Drop",
      version: "1",
      revision: "1",
      chainId: isMainnet ? "SN_MAIN" : "SN_SEPOLIA",
    },
    message: {
      recipient: address,
    },
  };
};
