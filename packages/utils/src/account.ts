import { addAddressPadding } from "starknet";

export type FormatAddressOptions = {
  first?: number;
  last?: number;
  size?: FormatAddressSize;
  padding?: boolean;
};

type FormatAddressSize = "sm" | "base" | "lg" | "full";

export function formatAddress(
  addr: string,
  { first, last, size = "base", padding = false }: FormatAddressOptions = {},
) {
  const full = padding ? addAddressPadding(addr) : addr;
  const { _first, _last } =
    first !== undefined || last !== undefined
      ? { _first: first ?? 0, _last: last ?? 0 }
      : { _first: sizeLen(size), _last: sizeLen(size) };

  return _first + _last === 0
    ? full
    : full.substring(0, _first) + "..." + full.substring(full.length - _last);
}

function sizeLen(size: FormatAddressSize) {
  switch (size) {
    case "sm":
      return 10;
    default:
    case "base":
      return 15;
    case "lg":
      return 20;
  }
}
