export function formatAddress(
  addr: string,
  {
    first = 0,
    last = 0,
    fullLength = false,
  }: { first?: number; last?: number; fullLength?: boolean } = {},
) {
  if (first + last > 66) {
    throw new Error("first + last should be less than 66");
  }
  const diff = 66 - addr.length;
  const full =
    diff && fullLength ? "0x" + "0".repeat(diff) + addr.substring(2) : addr;

  return first + last === 0
    ? full
    : full.substring(0, first) + "..." + full.substring(full.length - last);
}
