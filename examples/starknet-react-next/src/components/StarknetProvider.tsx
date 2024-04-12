import { sepolia } from "@starknet-react/chains";
import { Connector, StarknetConfig, starkscan } from "@starknet-react/core";
import { PropsWithChildren } from "react";
import CartridgeConnector from "@cartridge/connector";
import { RpcProvider } from "starknet";

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={connectors}
      explorer={starkscan}
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

const url =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
    ? "https://" +
      (process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL as string).replace(
        "cartridge-starknet-react-next-git",
        "keychain-git",
      )
    : process.env.XFRAME_URL;
const connectors = [
  new CartridgeConnector([{ target: "0xdeadbeef", method: "testMethod" }], {
    url,
  }) as never as Connector,
];
