import { constants } from "starknet";

const selectors = {
  ["0.0.2"]: {
    account: () => `controller`,
    deployment: (chainId: constants.StarknetChainId) =>
      `@deployment/${chainId}`,
    admin: (origin: string) => `@admin/${origin}`,
    session: (origin: string) => `@session/${origin}`,
    transaction: (hash: string) => `@transaction/${hash}`,
    register: (chainId: constants.StarknetChainId) =>
      `@register/${chainId}/set_device_key`,
  },
  ["0.0.3"]: {
    active: () => `active`,
    account: (address: string) => `@account/${address}`,
    deployment: (address: string, chainId: constants.StarknetChainId) =>
      `@deployment/${address}/${chainId}`,
    admin: (address: string, origin: string) => `@admin/${address}/${origin}`,
    session: (address: string, origin: string) =>
      `@session/${address}/${origin}`,
    transaction: (address: string, hash: string) =>
      `@transaction/${address}/${hash}`,
    register: (address: string, chainId: constants.StarknetChainId) =>
      `@register/${address}/${chainId}/set_public_key`,
  },
};

export default selectors;
