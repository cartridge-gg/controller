import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { Connector, StarknetConfig, starkscan } from "@starknet-react/core";
import { PropsWithChildren } from "react";
import CartridgeConnector from "@cartridge/connector";
import { RpcProvider } from "starknet";

const ETH_TOKEN_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={connectors}
      explorer={starkscan}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}

// const url = "https://keychain-git-client-deploy.preview.cartridge.gg/";
const url = "http://localhost:3001/";

function provider(chain: Chain) {
  switch (chain) {
    case mainnet:
      return new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET,
      });
    case sepolia:
    default:
      return new RpcProvider({
        nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA,
      });
  }
}

const connectors = [
  new CartridgeConnector(
    [
      {
        target: ETH_TOKEN_ADDRESS,
        method: "approve",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      },
      {
        target: ETH_TOKEN_ADDRESS,
        method: "transfer",
      },
      {
        target: ETH_TOKEN_ADDRESS,
        method: "mint",
      },
      {
        target: ETH_TOKEN_ADDRESS,
        method: "burn",
      },
      {
        target: ETH_TOKEN_ADDRESS,
        method: "allowance",
      },
    ],
    {
      url,
      rpc: process.env.NEXT_PUBLIC_RPC_MAINNET,
      // paymaster: {
      //   caller: shortString.encodeShortString("ANY_CALLER"),
      // },
      theme: "dope-wars",
      // colorMode: "light"
    },
  ) as never as Connector,
];
