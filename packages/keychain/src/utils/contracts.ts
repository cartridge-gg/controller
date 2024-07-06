import { BigNumberish, num } from "starknet";

export function formatAddress(
  addr: BigNumberish,
  { first = 0, last = 0 }: { first?: number; last?: number } = {},
) {
  if (first + last > 66) {
    throw new Error("first + last should be less than 66");
  }
  const parsed =
    typeof addr === "number"
      ? "0x" + addr.toString(16)
      : num.toHex(BigInt(addr));
  const diff = 66 - parsed.length;
  const full = diff ? "0x" + "0".repeat(diff) + parsed.substring(2) : parsed;

  return first + last === 0
    ? full
    : full.substring(0, first) + "..." + full.substring(full.length - last);
}
