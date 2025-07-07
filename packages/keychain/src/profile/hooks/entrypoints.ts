import { useMemo } from "react";
// import { useConnection as useKeychainConnection } from "@/hooks/connection";
// import { RpcProvider } from "starknet";

export function useEntrypoints({
  contractAddress: _,
}: {
  contractAddress: string;
}) {
  // TODO: Use provider if needed
  // const keychainConnection = useKeychainConnection();
  // const provider = new RpcProvider({
  //   nodeUrl: keychainConnection.rpcUrl || import.meta.env.VITE_RPC_SEPOLIA,
  // });

  const interfaces = useMemo(() => {
    return []; // TODO: Implement if needed
  }, []);

  const entrypoints = useMemo(() => {
    return []; // TODO: Implement if needed
  }, []);

  return { interfaces, entrypoints };
}
