import { PropsWithChildren } from "react";
import { mainnet } from "@starknet-start/chains";
import { voyager } from "@starknet-start/explorers";
import { jsonRpcProvider } from "@starknet-start/providers";
import { StarknetConfig } from "@starknet-start/react";
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
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
