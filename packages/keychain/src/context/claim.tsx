import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { ExternalWalletType, ExternalPlatform } from "@cartridge/controller";
import { useConnection } from "@/hooks/connection";
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
import { parseSignature } from "viem";
import { evmNetworks } from "@/components/purchasenew/wallet/config";

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

export interface ClaimContextType {
  // Claim data
  claims: MerkleClaim[];
  isLoading: boolean;
  error?: Error;

  // Wallet state
  walletAddress?: string;
  walletType?: ExternalWalletType | "controller";

  // Transaction state
  transactionHash?: string;
  isClaiming: boolean;

  // Computed states
  totalClaimable: number;
  isClaimed: boolean;
  isCheckingClaimed: boolean;

  // Actions
  setClaimKeys: (
    keys: string,
    address: string,
    type: ExternalWalletType | "controller",
  ) => void;
  claim: (claimIndices?: number[]) => Promise<string>;
  clearError: () => void;
}

export const ClaimContext = createContext<ClaimContextType | undefined>(
  undefined,
);

export interface ClaimProviderProps {
  children: ReactNode;
}

export const ClaimProvider = ({ children }: ClaimProviderProps) => {
  const { controller, isMainnet, externalSignMessage, externalSignTypedData } =
    useConnection();

  // Claim parameters
  const [claimKeys, setClaimKeysState] = useState<string | undefined>();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [walletType, setWalletType] = useState<
    ExternalWalletType | "controller" | undefined
  >();

  // Claim data
  const [claims, setClaims] = useState<MerkleClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const checkedClaimsRef = useRef<Set<string>>(new Set());

  // Transaction state
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [isClaiming, setIsClaiming] = useState(false);

  // Error state
  const [displayError, setDisplayError] = useState<Error | undefined>();

  // Fetch merkle claims from API
  useEffect(() => {
    if (!claimKeys || !walletAddress) {
      setClaims([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    client
      .request<MerkleClaimsForAddressQuery>(MerkleClaimsForAddressDocument, {
        keys: claimKeys.split(";"),
        address: walletAddress,
      })
      .then(async (result) => {
        const fetchedClaims: MerkleClaim[] = result.merkleClaimsForAddress.map(
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
        setClaims(fetchedClaims);
        // Reset checked claims when new claims are loaded
        checkedClaimsRef.current = new Set();
      })
      .catch((error) => {
        setDisplayError(error as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [claimKeys, walletAddress]);

  // Check if claims are already claimed
  const checkAllClaims = useCallback(
    async (claimsToCheck: MerkleClaim[]) => {
      if (claimsToCheck.length === 0 || !controller || !walletAddress) {
        return;
      }

      const updatedClaims = await Promise.all(
        claimsToCheck.map(async (claim) => {
          try {
            // https://github.com/cartridge-gg/merkle_drop/blob/main/src/types/leaf.cairo
            let leafHash = hash.computePoseidonHashOnElements(
              CallData.compile(leafData(walletAddress, claim)),
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
            setDisplayError(error as Error);
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
    [controller, walletAddress],
  );

  // Auto-check claims when they're loaded
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

  // Computed: total claimable amount
  const totalClaimable = claims
    .filter((claim) => !claim.claimed)
    .reduce((acc, claim) => acc + Number(claim.data[0] || 0), 0);

  // Computed: are all claims already claimed?
  const isClaimed = claims.length > 0 && claims.every((claim) => claim.claimed);

  // Computed: are we still checking if claims are claimed?
  const isCheckingClaimed =
    claims.length > 0 && claims.every((claim) => claim.loading);

  // Set claim parameters
  const setClaimKeys = useCallback(
    (
      keys: string,
      address: string,
      type: ExternalWalletType | "controller",
    ) => {
      setClaimKeysState(keys);
      setWalletAddress(address);
      setWalletType(type);
      // Reset transaction state when changing claim keys
      setTransactionHash(undefined);
      setDisplayError(undefined);
    },
    [],
  );

  // Execute claim
  const claim = useCallback(
    async (claimIndices?: number[]): Promise<string> => {
      if (!controller || !claims.length || !walletAddress || !walletType) {
        const error = new Error("Missing required data for claim");
        setDisplayError(error);
        throw error;
      }

      try {
        setIsClaiming(true);
        setDisplayError(undefined);

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
          const { result, error } = await externalSignMessage(
            walletAddress,
            msg,
          );
          if (error) {
            throw new Error(error);
          }

          const { r, s, v } = parseSignature(result as `0x${string}`);
          signature = CallData.compile([
            num.toHex(v!),
            cairo.uint256(r),
            cairo.uint256(s),
          ]);

          signature.unshift("0x0"); // Enum Ethereum Signature
        } else {
          const msg: TypedData = starknetMessage(
            controller.address(),
            isMainnet,
          );
          if (walletType === "controller") {
            const result = await controller.signMessage(msg);
            signature = result as Array<string>;
          } else {
            const { result, error } = await externalSignTypedData(
              walletType,
              msg,
            );
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
            leaf_data: CallData.compile(leafData(walletAddress, claim)),
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
        setTransactionHash(transaction_hash);

        return transaction_hash;
      } catch (error) {
        const err = error as Error;
        setDisplayError(err);
        throw err;
      } finally {
        setIsClaiming(false);
      }
    },
    [
      controller,
      claims,
      walletAddress,
      walletType,
      isMainnet,
      externalSignMessage,
      externalSignTypedData,
    ],
  );

  const clearError = useCallback(() => {
    setDisplayError(undefined);
  }, []);

  const contextValue: ClaimContextType = {
    // Claim data
    claims,
    isLoading,
    error: displayError,

    // Wallet state
    walletAddress,
    walletType,

    // Transaction state
    transactionHash,
    isClaiming,

    // Computed states
    totalClaimable,
    isClaimed,
    isCheckingClaimed,

    // Actions
    setClaimKeys,
    claim,
    clearError,
  };

  return (
    <ClaimContext.Provider value={contextValue}>
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaim = () => {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error("useClaim must be used within ClaimProvider");
  }
  return context;
};

// Helper functions

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
