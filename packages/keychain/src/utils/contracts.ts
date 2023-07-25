import { number } from "starknet";

export function formatAddress(addr: number.BigNumberish) {
  if (typeof addr === "number") {
    addr = "0x" + addr.toString(16);
  } else {
    addr = number.toHex(number.toBN(addr));
  }

  return addr.substr(0, 6) + "..." + addr.substr(-4);
}
