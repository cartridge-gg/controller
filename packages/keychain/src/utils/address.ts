/**
 * Convert an address to a normalized format.
 * From 0x008b9...7006 into 0x8b9...7006
 * @param addr Address to normalized
 * @returns Normalized address
 */
export function normalizeAddress(addr: string): string {
  addr = addr.toLowerCase();
  addr = addr.startsWith("0x") ? addr.substring(2) : addr;

  // Remove leading zeros
  addr = addr.replace(/^0+/, "");

  if (addr === "") {
    addr = "0";
  }

  return "0x" + addr;
}
