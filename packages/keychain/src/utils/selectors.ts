import { constants } from "starknet";

const selectors = {
  ["0.0.1"]: {
    active: () => `active`,
    account: (address: string) => `@account/${address}`,
    deployment: (address: string, chainId: constants.StarknetChainId) =>
      `@deployment/${address}/${chainId}`,
    admin: (address: string, origin: string) => `@admin/${address}/${origin}`,
    session: (
      address: string,
      origin: string,
      chainId: constants.StarknetChainId,
    ) => `@session/${address}/${origin}/${chainId}`,
    transaction: (address: string, hash: string) =>
      `@transaction/${address}/${hash}`,
  },
};

export default selectors;
