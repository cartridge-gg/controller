import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useConnection } from "./context";
import { InterfaceAbi, FunctionAbi } from "starknet";

export const useEntrypoints = ({ address }: { address: string }) => {
  const [entrypoints, setEntrypoints] = useState<string[]>([]);
  const { provider } = useConnection();

  const { data, isFetching } = useQuery({
    enabled: !!address && address !== "0x0",
    queryKey: ["contract", address],
    queryFn: async () => {
      try {
        const code = await provider.getClassAt(address);
        return code.abi
          .filter((element) => element.type === "interface")
          .flatMap((element: InterfaceAbi) =>
            element.items
              .filter(
                (item: FunctionAbi) => item.state_mutability === "external",
              )
              .map((item: FunctionAbi) => item.name),
          );
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (!data) return;
    if (entrypoints.length === data.length) return;
    setEntrypoints(data);
  }, [data, entrypoints, setEntrypoints]);

  return { entrypoints, isFetching };
};
