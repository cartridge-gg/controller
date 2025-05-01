import { Hex, hexToNumber } from "viem";

export function formatName(name: string, tokenId: string) {
  const tokenIdNumber = hexToNumber(tokenId as Hex);
  return name.includes(`${tokenIdNumber}`) ? name : `${name} #${tokenIdNumber}`;
}
