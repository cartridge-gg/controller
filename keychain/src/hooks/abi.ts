import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import { Abi, constants, defaultProvider } from "starknet";
import { getClassByHash } from "utils/rpc";

const DELAY = 5000;

export const useAbi = (
  address?: string,
  watch?: boolean,
): { abi: Abi; error: Error; loading: boolean } => {
  const [abi, setAbi] = useState<Abi>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [polling, setPolling] = useState<boolean>(false);

  useEffect(() => {
    if (address) {
      setLoading(true);

      fetchAbi(address)
        .then((abi) => setAbi(abi))
        .catch((error) => setError(error))
        .finally(() => {
          setLoading(false);
          setPolling(watch);
        });
    }
  }, [address, watch]);

  useInterval(
    () => {
      fetchAbi(address)
        .then((abi) => setAbi(abi))
        .catch((error) => setError(error));
    },
    address && polling ? DELAY : null,
  );

  return {
    abi: abi,
    error: error,
    loading: loading,
  };
};

const fetchAbi = async (account: string): Promise<Abi> => {
  const cls = await defaultProvider.getClassAt(account);

  // check for proxy
  const proxy = cls.abi.find((method) => method.name === "__default__");
  if (!proxy) {
    return cls.abi;
  }

  const { result } = await defaultProvider.callContract({
    contractAddress: account,
    entrypoint: "get_implementation",
  });

  const impl = await getClassByHash(
    constants.StarknetChainId.TESTNET,
    result[0],
  );

  return impl.abi;
};
