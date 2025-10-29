import { useNavigation } from "@/context";
import {
  Button,
  Card,
  CardListContent,
  CardListItem,
  Empty,
  GiftIcon,
  HeaderInner,
  LayoutContent,
  LayoutFooter,
  Skeleton,
} from "@cartridge/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMerkleClaim, MerkleClaim } from "@/hooks/merkle-claim";
import { Item, ItemType, usePurchaseContext } from "@/context/purchase";
import { ErrorAlert } from "@/components/ErrorAlert";
import { CollectionItem } from "../starterpack/collections";
import { StarterpackReceiving } from "../starterpack/starterpack";
import { ExternalWalletType } from "@cartridge/controller";
import { getWallet } from "../wallet/config";
import { formatAddress } from "@cartridge/ui/utils";
import type { BackendStarterpackDetails } from "@/context";
import { useConnection } from "@/hooks/connection";
import { cairo, CallData, hash, num, shortString, TypedData } from "starknet";
import { parseSignature } from "viem";
import { MerkleDropNetwork } from "@cartridge/ui/utils/api/cartridge";

export function Claim() {
  const { keys, address: externalAddress, type } = useParams();
  const { goBack, navigate } = useNavigation();
  const {
    starterpackDetails: starterpackDetailsRaw,
    setClaimItems,
    setTransactionHash,
  } = usePurchaseContext();
  const { controller, isMainnet, externalSignMessage, externalSignTypedData } = useConnection();

  const starterpackDetails = starterpackDetailsRaw as
    | BackendStarterpackDetails
    | undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [individualClaimStates, setIndividualClaimStates] = useState<Map<string, boolean>>(new Map());

  const {
    claims: claimsData,
    isLoading: isLoadingClaims,
    onSendClaim,
  } = useMerkleClaim({
    keys: keys!,
    address: externalAddress!,
    type: type as ExternalWalletType | "controller",
  });

  const combinedClaims = useMemo(() => {
    const groups = new Map<string, MerkleClaim[]>();

    // Group claims by description/key + network
    claimsData.forEach((claim) => {
      const groupKey = `${claim.description ?? claim.key}-${claim.network}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(claim);
    });

    // Convert to combined display items
    return Array.from(groups.entries()).map(([groupKey, claims]) => {
      const firstClaim = claims[0];
      const totalAmount = claims
        .filter((claim) => !claim.claimed)
        .reduce((acc, claim) => acc + claimAmount(claim), 0);

      const isAnyLoading = claims.some((claim) => claim.loading);
      const isAllClaimed = claims.every((claim) => claim.claimed);

      return {
        key: groupKey,
        name: firstClaim.description ?? firstClaim.key,
        network: firstClaim.network,
        numAvailable: totalAmount,
        isLoading: isAnyLoading,
        isClaimed: isAllClaimed,
        claims: claims, // Keep original claims for backend operations
      };
    });
  }, [claimsData]);

  useEffect(() => {
    if (combinedClaims.length === 0) {
      setClaimItems([]);
      return;
    }

    const items: Item[] = [];
    combinedClaims
      .filter((item) => !item.isClaimed && item.numAvailable > 0)
      .forEach((item) => {
        items.push({
          title: `(${item.numAvailable}) ${item.name}`,
          type: ItemType.NFT,
          icon: <GiftIcon variant="solid" />,
        });
      });

    setClaimItems(items);
  }, [combinedClaims, setClaimItems]);

  const wallet = useMemo(() => {
    return getWallet(type as ExternalWalletType | "controller");
  }, [type]);

  const onSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const hash = await onSendClaim();
      setTransactionHash(hash);
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      const err = error as Error;
      setError(err);

      // Check if this is a transaction size/resource error and switch to fallback mode
      const errorMessage = err.message.toLowerCase();
      if (
        errorMessage.includes('insufficient') ||
        errorMessage.includes('resource') ||
        errorMessage.includes('gas') ||
        errorMessage.includes('limit') ||
        errorMessage.includes('size') ||
        errorMessage.includes('too large') ||
        errorMessage.includes('out of resources')
      ) {
        setIsFallbackMode(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onSendClaim, setTransactionHash, navigate]);

  const onSendIndividualClaim = useCallback(async (claim: MerkleClaim) => {
    if (!controller) {
      throw new Error("Controller not available");
    }

    const claimKey = `${claim.key}-${claim.index}`;

    setIndividualClaimStates(prev => new Map(prev.set(claimKey, true)));

    try {
      const isEvm = claim.network === MerkleDropNetwork.Ethereum;

      let signature: any;
      if (isEvm) {
        const msg = evmMessage(controller.address());
        const { result, error } = await externalSignMessage(externalAddress!, msg);
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
        const msg: TypedData = starknetMessage(controller.address(), isMainnet);
        if (type === "controller") {
          const result = await controller.signMessage(msg);
          signature = result as Array<string>;
        } else {
          const { result, error } = await externalSignTypedData(type as ExternalWalletType, msg);
          if (error) {
            throw new Error(error);
          }
          signature = result as Array<string>;
        }

        signature.unshift(num.toHex(signature.length));
        signature.unshift("0x1"); // Enum Starknet Signature
      }

      const raw = {
        merkle_tree_key: merkleTreeKey(claim),
        proof: claim.merkleProof,
        leaf_data: CallData.compile(leafData(externalAddress!, claim)),
        recipient: controller.address(),
        signature: { ...signature },
      };

      const call = {
        contractAddress: import.meta.env.VITE_MERKLE_DROP_CONTRACT,
        entrypoint: "verify_and_forward",
        calldata: CallData.compile(raw),
      };

      const { transaction_hash } = await controller.executeFromOutsideV3([call]);
      setTransactionHash(transaction_hash);
      navigate("/purchase/pending", { reset: true });
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIndividualClaimStates(prev => new Map(prev.set(claimKey, false)));
    }
  }, [controller, externalAddress, externalSignMessage, externalSignTypedData, type, isMainnet, setTransactionHash, navigate]);

  const isClaimed = useMemo(() => {
    return combinedClaims.every((item) => item.isClaimed);
  }, [combinedClaims]);

  const isCheckingClaimed = useMemo(() => {
    return combinedClaims.every((item) => item.isLoading);
  }, [combinedClaims]);

  const totalClaimable = useMemo(() => {
    return combinedClaims.reduce((acc, item) => acc + item.numAvailable, 0);
  }, [combinedClaims]);

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
        {combinedClaims.length === 0 ? (
          <Empty
            icon="claim"
            title="Nothing to claim from this wallet"
            className="h-full md:h-[420px]"
          />
        ) : (
          <div className="flex flex-col gap-4">
            <StarterpackReceiving
              mintAllowance={starterpackDetails?.mintAllowance}
              starterpackItems={starterpackDetails?.starterPackItems}
            />

            {isFallbackMode && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="text-orange-600 text-sm font-medium">
                    Individual Claim Mode
                  </div>
                </div>
                <div className="text-orange-700 text-xs mt-1">
                  Combined claim failed due to transaction size. Claim items individually below.
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="text-foreground-400 text-xs font-semibold">
                Your Collections
              </div>
              <Card>
                <CardListContent>
                  {isFallbackMode ? (
                    // Individual claim mode - show each claim separately
                    claimsData
                      .filter((claim) => !claim.claimed)
                      .map((claim) => {
                        const claimKey = `${claim.key}-${claim.index}`;
                        const isSubmitting = individualClaimStates.get(claimKey) || false;

                        return (
                          <CardListItem
                            key={`${claim.key}-${claim.index}`}
                            className="flex flex-row justify-between items-center"
                          >
                            <CollectionItem
                              name={claim.description ?? claim.key}
                              network={claim.network}
                              numAvailable={claimAmount(claim)}
                              isLoading={claim.loading}
                            />
                            <Button
                              onClick={() => onSendIndividualClaim(claim)}
                              isLoading={isSubmitting}
                              disabled={isSubmitting}
                            >
                              Claim
                            </Button>
                          </CardListItem>
                        );
                      })
                  ) : (
                    // Combined claim mode - show grouped items
                    combinedClaims.map((item) => (
                      <CardListItem
                        key={item.key}
                        className="flex flex-row justify-between"
                      >
                        <CollectionItem
                          name={item.name}
                          network={item.network}
                          numAvailable={item.numAvailable}
                          isLoading={item.isLoading}
                        />
                      </CardListItem>
                    ))
                  )}
                </CardListContent>
              </Card>
            </div>
          </div>
        )}
      </LayoutContent>
      <LayoutFooter>
        {error && <ErrorAlert title="Error" description={error.message} />}
        <div className="flex justify-between border border-background-300 rounded py-2 px-3">
          <div className="flex items-center gap-1 text-foreground-300 text-xs">
            {wallet.subIcon} {wallet.name} (
            {formatAddress(externalAddress!, { first: 5, last: 4 })})
          </div>
          <div className="flex items-center gap-1 text-foreground-300 text-xs">
            Connected
          </div>
        </div>
        {combinedClaims.length === 0 ? (
          <Button onClick={() => goBack()}>Check Another Wallet</Button>
        ) : isFallbackMode ? (
          <Button onClick={() => goBack()}>Check Another Wallet</Button>
        ) : (
          <Button
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={isClaimed || isCheckingClaimed || error !== null}
          >
            {isClaimed
              ? "Already Claimed"
              : isCheckingClaimed
                ? "Loading..."
                : `Claim (${totalClaimable}) `}
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

const claimAmount = (claim: MerkleClaim) => {
  if (claim.data.length === 1) {
    return Number(claim.data[0]);
  }

  return claim.data.length;
};

const merkleTreeKey = (claim: MerkleClaim) => {
  return {
    chain_id: shortString.encodeShortString(claim.network),
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
