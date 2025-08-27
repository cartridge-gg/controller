import { useCallback, useEffect, useState } from "react";
import { client } from "@/utils/graphql";
import {
  MerkleClaimsForAddressDocument,
  MerkleClaimsForAddressQuery,
} from "@cartridge/ui/utils/api/cartridge";

export interface MerkleClaim {
  data: string[];
  claimed: boolean;
  merkleProof: string[];
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

  useEffect(() => {
    client
      .request<MerkleClaimsForAddressQuery>(MerkleClaimsForAddressDocument, {
        input: { address, key },
      })
      .then((result) => {
        const claims: MerkleClaim[] = result.merkleClaimsForAddress.map(
          (claim) => ({
            data: claim.data,
            claimed: claim.claimed,
            merkleProof: claim.merkleProof ?? [],
          }),
        );
        setClaims(claims);
      })
      .catch((error) => {
        setError(error as Error);
      });
  }, [key, address]);

  const onSendClaim = useCallback(async () => {}, []);

  return {
    claims,
    error,
    onSendClaim,
  };
};
