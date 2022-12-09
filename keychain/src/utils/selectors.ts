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
};

export default selectors;
