"use client";

import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import { StarknetConfig, starkscan } from "@starknet-react/core";
import { PropsWithChildren } from "react";
import { RpcProvider } from "starknet";
import ControllerConnector from "@cartridge/connector/controller";

const ETH_TOKEN_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

const rpc = process.env.NEXT_PUBLIC_RPC_SEPOLIA!;

const policies = [
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
];

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={[controller]}
      explorer={starkscan}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}

const controller = new ControllerConnector({
  policies,
  rpc,
  url:
    process.env.NEXT_PUBLIC_KEYCHAIN_DEPLOYMENT_URL ??
    process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL,
  profileUrl:
    process.env.NEXT_PUBLIC_PROFILE_DEPLOYMENT_URL ??
    process.env.NEXT_PUBLIC_PROFILE_FRAME_URL,
  indexerUrl: "https://api.cartridge.gg/x/ls-erc/torii/graphql",
  namespace: process.env.NEXT_PUBLIC_NAMESPACE,
  // theme: "dope-wars",
  // colorMode: "light"
  tokens: {
    erc20: [
      // $LORDS
      // "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      // $FLIP
      "0x01bfe97d729138fc7c2d93c77d6d1d8a24708d5060608017d9b384adf38f04c7",
    ],
  },
});

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
