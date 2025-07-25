import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { useState } from "react";

export const useStarkAddress = ({ name }: { name: string }) => {
  const { controller } = useConnection();
  const provider = controller?.provider;
  const [error, setError] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    enabled: !!name && name.includes(".stark"),
    queryKey: ["starknetid", name],
    queryFn: async () => {
      setError("");
      const address = await provider?.getAddressFromStarkName(name);
      if (!address || address === "0x0") {
        setError("Could not get address from stark name");
        return null;
      }
      return address;
    },
  });

  return { address: data ?? "", error, isFetching };
};
