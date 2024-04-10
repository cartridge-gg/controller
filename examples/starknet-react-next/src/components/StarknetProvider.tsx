import { sepolia } from "@starknet-react/chains";
import { Connector, StarknetConfig } from "@starknet-react/core";
import { PropsWithChildren } from "react";
import CartridgeConnector from "@cartridge/connector";
import { RpcProvider } from "starknet";

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={connectors}
      provider={(_chain) =>
        new RpcProvider({
          nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA,
        })
      }
    >
      {children}
    </StarknetConfig>
  );
}

const url = process.env.XFRAME_URL;
const connectors = [
  new CartridgeConnector([{ target: "0xdeadbeef", method: "testMethod" }], {
    url,
  }) as never as Connector,
];
