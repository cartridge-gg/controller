import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { InterfaceAbi, FunctionAbi } from "starknet";

export const useEntrypoints = ({ address }: { address: string }) => {
  const [entrypoints, setEntrypoints] = useState<string[]>([]);
  const { controller } = useConnection();

  const { data, isFetching } = useQuery({
    enabled: !!address && address !== "0x0",
    queryKey: ["contract", address],
    queryFn: async () => {
      try {
        // TODO: Remove dependency on getClassAt since it is super slow
        const code = await controller?.provider?.getClassAt(address);
        if (!code) return;
        const interfaces = code.abi.filter(
          (element) => element.type === "interface",
        );
        if (interfaces.length > 0) {
          return interfaces.flatMap((element: InterfaceAbi) =>
            element.items.map((item: FunctionAbi) => item.name),
          );
        }
        const functions = code.abi.filter(
          (element) => element.type === "function",
        );
        return functions.map((item: FunctionAbi) => item.name);
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
