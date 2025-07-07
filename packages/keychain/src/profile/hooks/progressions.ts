import { useMemo } from "react";
import { useQuery } from "react-query";
import { useAccount } from "./account";
import { useProfileContext } from "./profile";
// import { useConnection as useKeychainConnection } from "@/hooks/connection";
// import { RpcProvider } from "starknet";

export function useProgressions() {
  const { address } = useAccount();
  const { project } = useProfileContext();
  // TODO: Use provider if needed
  // const keychainConnection = useKeychainConnection();
  // const provider = new RpcProvider({
  //   nodeUrl: keychainConnection.rpcUrl || import.meta.env.VITE_RPC_SEPOLIA,
  // });

  const { data: progressions = [], isFetching } = useQuery({
    enabled: !!address && !!project,
    queryKey: ["progressions", address, project],
    queryFn: async () => {
      // TODO: Implement progression fetching if needed
      return [];
    },
  });

  const progression = useMemo(() => {
    return progressions[0] || null;
  }, [progressions]);

  return { progression, progressions, isFetching };
}
