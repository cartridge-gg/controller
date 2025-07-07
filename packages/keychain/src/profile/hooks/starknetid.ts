import { useQuery } from "react-query";
import { useConnection as useKeychainConnection } from "@/hooks/connection";
import { useState } from "react";
import { RpcProvider } from "starknet";

export const useStarkAddress = ({ name }: { name: string }) => {
  const keychainConnection = useKeychainConnection();
  const provider = new RpcProvider({
    nodeUrl: keychainConnection.rpcUrl || import.meta.env.VITE_RPC_SEPOLIA,
  });
  const [error, setError] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    enabled: !!name && name.includes(".stark"),
    queryKey: ["starknetid", name],
    queryFn: async () => {
      setError("");
      const address = await provider.getAddressFromStarkName(name);
      if (!address || address === "0x0") {
        setError("Could not get address from stark name");
        return null;
      }
      return address;
    },
  });

  return { address: data ?? "", error, isFetching };
};
