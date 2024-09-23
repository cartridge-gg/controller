import { addAddressPadding } from "starknet";

export function formatAddress(
  addr: string,
  {
    first = 0,
    last = 0,
    padding = false,
  }: { first?: number; last?: number; padding?: boolean } = {},
) {
  const full = padding ? addAddressPadding(addr) : addr;

  return first + last === 0
    ? full
    : full.substring(0, first) + "..." + full.substring(full.length - last);
}
