export function truncateHash(hash: string) {
  return `${hash.substring(0, 6)}...${hash.substring(
    hash.length - 4,
    hash.length,
  )}`;
}
