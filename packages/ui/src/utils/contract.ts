export function truncateHash(
  hash: string,
  startLength: number = 6,
  endLength: number = 4,
) {
  return `${hash.substring(0, startLength)}...${hash.substring(
    hash.length - endLength,
    hash.length,
  )}`;
}
