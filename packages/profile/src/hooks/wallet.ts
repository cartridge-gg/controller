import { useQuery } from "react-query";
import { useConnection } from "./context";
import { useMemo } from "react";

const ARGENT_CLASS_HASH = BigInt(
  "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f",
);
const BRAAVOS_BASE_ACCOUNT_CLASS_HASH: BigInt = BigInt(
  "0x013bfe114fb1cf405bfc3a7f8dbe2d91db146c17521d40dcf57e16d6b59fa8e6",
);
const BRAAVOS_ACCOUNT_CLASS_HASH: BigInt = BigInt(
  "0x00816dd0297efc55dc1e7559020a3a825e81ef734b558f03c83325d4da7e6253",
);
const OZ_ACCOUNT_CLASS_HASH: BigInt = BigInt(
  "0x04a444ef8caf8fa0db05da60bf0ad9bae264c73fa7e32c61d245406f5523174b",
);
const CONTROLLER_CLASS_HASH: BigInt = BigInt(
  "0x511dd75da368f5311134dee2356356ac4da1538d2ad18aa66d57c47e3757d59",
);

export type Wallet = "Controller" | "ArgentX" | "Braavos" | "OpenZeppelin";

export function useWallet({ address }: { address: string }) {
  const { provider } = useConnection();

  const { data, isFetching } = useQuery({
    enabled: !!address && address.startsWith("0x"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryKey: ["classhash", address],
    queryFn: async () => {
      try {
        return await provider.getClassHashAt(BigInt(address));
      } catch (error) {
        return null;
      }
    },
  });

  const wallet: Wallet | null = useMemo(() => {
    console.log("data", data);
    if (!data) return null;
    const classHash = BigInt(data);
    if (classHash === ARGENT_CLASS_HASH) {
      return "ArgentX";
    }
    if (
      classHash === BRAAVOS_BASE_ACCOUNT_CLASS_HASH ||
      classHash === BRAAVOS_ACCOUNT_CLASS_HASH
    ) {
      return "Braavos";
    }
    if (classHash === OZ_ACCOUNT_CLASS_HASH) {
      return "OpenZeppelin";
    }
    if (classHash === CONTROLLER_CLASS_HASH) {
      return "Controller";
    }
    return null;
  }, [data]);

  return { wallet, isFetching };
}
