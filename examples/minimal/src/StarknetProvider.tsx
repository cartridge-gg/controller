import { PropsWithChildren } from "react";
import { mainnet } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import ControllerConnector from "@cartridge/connector/controller";

const RPC_URL = "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";

export const controllerConnector = new ControllerConnector({
  chains: [{ rpcUrl: RPC_URL }],
  url: import.meta.env.VITE_KEYCHAIN_FRAME_URL || undefined,
  preset: "loot-survivor",
});

const provider = jsonRpcProvider({
  rpc: () => ({ nodeUrl: RPC_URL }),
});

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={provider}
      connectors={[controllerConnector]}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
