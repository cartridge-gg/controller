import { ReactNode } from "react";
import { StarknetConfig, jsonRpcProvider, voyager } from "@starknet-react/core";
import { sepolia, mainnet } from "@starknet-react/chains";

const defaultConfig = {
  defaultChainId: BigInt(1),
  nodeUrl: "https://test.rpc",
};

export function withStarknet(children: ReactNode, config = defaultConfig) {
  return (
    <StarknetConfig
      explorer={voyager}
      chains={[sepolia, mainnet]}
      defaultChainId={config.defaultChainId}
      provider={jsonRpcProvider({
        rpc: () => ({ nodeUrl: config.nodeUrl }),
      })}
    >
      {children}
    </StarknetConfig>
  );
}
