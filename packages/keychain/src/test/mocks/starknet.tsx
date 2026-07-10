import { ReactNode } from "react";
import { StarknetConfig } from "@starknet-start/react";
import { sepolia, mainnet } from "@starknet-start/chains";
import { cartridge } from "@starknet-start/explorers";
import { jsonRpcProvider } from "@starknet-start/providers";

const defaultConfig = {
  defaultChainId: BigInt(1),
  nodeUrl: "https://test.rpc",
};

export function withStarknet(children: ReactNode, config = defaultConfig) {
  return (
    <StarknetConfig
      explorer={cartridge}
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
