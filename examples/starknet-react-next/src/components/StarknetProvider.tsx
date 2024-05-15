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
  !process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL.split(".")[0] === "cartridge-starknet-react-next"
    ? process.env.XFRAME_URL
    : "https://" +
    (process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? "").replace(
      "cartridge-starknet-react-next",
      "keychain",
    )

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
      icon: {
        light: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGRkJDQjRBICIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSIjMEYxNDEwIi8+PC9zdmc+",
        dark: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMDAwMDAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg=="
      },
      theme: {
        colors: {
          // e.g. button bg
          primary: "#00b4d8",
          // e.g. button bg hover
          secondary: {
            dark: "red",
            light: "green",
          },
        }
      },
    }
  ) as never as Connector,
];
