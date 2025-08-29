import { useCallback, useEffect, useState } from "react";
import { client } from "@/utils/graphql";
import {
  MerkleClaimsForAddressDocument,
  MerkleClaimsForAddressQuery,
  MerkleDropNetwork,
} from "@cartridge/ui/utils/api/cartridge";

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
  const [error, setError] = useState<Error | null>(null);
  const [claims, setClaims] = useState<MerkleClaim[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    client
      .request<MerkleClaimsForAddressQuery>(MerkleClaimsForAddressDocument, {
        key,
        address,
      })
      .then((result) => {
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
      })
      .catch((error) => {
        setError(error as Error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [key, address]);

  const onSendClaim = useCallback(async () => {}, []);

  return {
    claims,
    isLoading,
    error,
    onSendClaim,
  };
};
