import { useCallback } from "react";

export const useClaim = () => {
  const getMerkleClaim = useCallback(async (_key: string, _address: string) => {
    return {
      contractAddress: "0xdeadbeef",
      entrypoint: "verify_and_forward",
      proof: [],
    };
  }, []);
  const onSendClaim = useCallback(async () => {}, []);

  return {
    onSendClaim,
    getMerkleClaim,
  };
};
