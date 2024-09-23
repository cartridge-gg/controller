import { addAddressPadding } from "starknet";

export type FormatAddressOptions = {
  first?: number;
  last?: number;
  padding?: boolean;
};

export function formatAddress(
  addr: string,
  { first = 0, last = 0, padding = false }: FormatAddressOptions = {},
) {
  const full = padding ? addAddressPadding(addr) : addr;

  return first + last === 0
    ? full
    : full.substring(0, first) + "..." + full.substring(full.length - last);
}
