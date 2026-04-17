import { shortString } from "starknet";

export function stringFromByteArray(arr: string[]) {
  arr = arr.slice(1, -1);
  while (arr.length > 0 && arr[arr.length - 1] === "0x0") {
    arr = arr.slice(0, -1);
  }

  return arr.map((i) => shortString.decodeShortString(i)).join("");
}
