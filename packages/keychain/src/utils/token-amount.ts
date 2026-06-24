export function parseTokenAmount(
  value: string | undefined,
  decimals: number,
): bigint | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d+(\.\d*)?$/.test(trimmed)) {
    return undefined;
  }

  const [whole, fractional = ""] = trimmed.split(".");
  if (fractional.length > decimals) {
    return undefined;
  }

  const base = 10n ** BigInt(decimals);
  const wholeAmount = BigInt(whole) * base;
  const fractionalAmount = BigInt(fractional.padEnd(decimals, "0") || "0");
  return wholeAmount + fractionalAmount;
}
