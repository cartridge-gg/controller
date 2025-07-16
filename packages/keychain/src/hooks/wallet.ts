import { useQuery } from "react-query";
import { useConnection } from "@/hooks/connection";
import { useMemo, useState } from "react";
import { BigNumberish } from "starknet";
import { WalletType } from "@cartridge/ui";

const ARGENT_ACCOUNT_CLASS_HASHES: BigNumberish[] = [
  BigInt("0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f"),
];
const BRAAVOS_ACCOUNT_CLASS_HASHES: BigNumberish[] = [
  BigInt("0x02c8c7e6fbcfb3e8e15a46648e8914c6aa1fc506fc1e7fb3d1e19630716174bc"),
  BigInt("0x013bfe114fb1cf405bfc3a7f8dbe2d91db146c17521d40dcf57e16d6b59fa8e6"),
  BigInt("0x00816dd0297efc55dc1e7559020a3a825e81ef734b558f03c83325d4da7e6253"),
];
const OZ_ACCOUNT_CLASS_HASHES: BigNumberish[] = [
  BigInt("0x04a444ef8caf8fa0db05da60bf0ad9bae264c73fa7e32c61d245406f5523174b"),
];
const CONTROLLER_CLASS_HASHES: BigNumberish[] = [
  BigInt("0x511dd75da368f5311134dee2356356ac4da1538d2ad18aa66d57c47e3757d59"),
  BigInt("0x743c83c41ce99ad470aa308823f417b2141e02e04571f5c0004e743556e7faf"),
];

export function useWallet({ address }: { address: string }) {
  const { controller } = useConnection();
  const provider = controller?.provider;
  const [error, setError] = useState<string>("");

  const { data, isFetching } = useQuery({
    enabled: !!address && address.startsWith("0x"),
    queryKey: ["classhash", address],
    queryFn: async () => {
      try {
        setError("");
        return await provider?.getClassHashAt(BigInt(address));
      } catch (error: unknown) {
        if (
          (error as { message: string }).message.includes("Contract not found")
        ) {
          setError(
            "No contract detected at this address. I understand and agree to send funds to an undeployed address.",
          );
        }
        return null;
      }
    },
  });

  const wallet: WalletType = useMemo(() => {
    if (!data) return WalletType.None;
    const classHash = BigInt(data);
    if (ARGENT_ACCOUNT_CLASS_HASHES.includes(classHash)) {
      return WalletType.ArgentX;
    }
    if (BRAAVOS_ACCOUNT_CLASS_HASHES.includes(classHash)) {
      return WalletType.Braavos;
    }
    if (OZ_ACCOUNT_CLASS_HASHES.includes(classHash)) {
      return WalletType.OpenZeppelin;
    }
    if (CONTROLLER_CLASS_HASHES.includes(classHash)) {
      return WalletType.Controller;
    }
    setError(
      "No account detected at this address. I understand and agree to send funds to a non-Account contract.",
    );
    return WalletType.None;
  }, [data]);

  return { wallet, error, isFetching };
}
