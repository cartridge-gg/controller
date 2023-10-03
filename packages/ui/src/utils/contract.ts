export function truncateAddress(addr: string) {
  return `${addr.substring(0, 4)}...${addr.substring(
    ADDRESS_FULL_LENGTH - 4,
    ADDRESS_FULL_LENGTH,
  )}`;
}

const ADDRESS_FULL_LENGTH = 42;
