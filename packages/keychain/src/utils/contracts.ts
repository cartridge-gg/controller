import { BigNumberish, num } from "starknet";

export function formatAddress(
  addr: BigNumberish,
  { first = 6, last = 4 }: { first?: number; last?: number } = {},
) {
  if (typeof addr === "number") {
    addr = "0x" + addr.toString(16);
  } else {
    addr = num.toHex(BigInt(addr));
  }

  return addr.substr(0, first) + "..." + addr.substr(-last);
}
