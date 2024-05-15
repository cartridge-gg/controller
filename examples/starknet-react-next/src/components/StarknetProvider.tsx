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
  process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL === "preview"
    ? "https://" +
      (process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL as string).replace(
        "cartridge-starknet-react-next",
        "keychain",
      )
    : process.env.XFRAME_URL;

const connectors = [
  new CartridgeConnector(
    [
      {
        target:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        method: "approve",
      },
      {
        target:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        method: "transfer",
      },
    ],
    {
      url,
    },
  ) as never as Connector,
];
