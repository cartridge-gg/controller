"use client";

import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  jsonRpcProvider,
  StarknetConfig,
  starkscan,
} from "@starknet-react/core";
import { PropsWithChildren } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { Policy } from "@cartridge/controller";

const rpc = process.env.NEXT_PUBLIC_RPC_SEPOLIA!;

export const ETH_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_CONTRACT_ADDRESS =
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

const policies: Policy[] = [
  {
    target: ETH_CONTRACT_ADDRESS,
    method: "approve",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    target: ETH_CONTRACT_ADDRESS,
    method: "transfer",
  },
  {
    target: ETH_CONTRACT_ADDRESS,
    method: "mint",
  },
  {
    target: ETH_CONTRACT_ADDRESS,
    method: "burn",
  },
  {
    target: ETH_CONTRACT_ADDRESS,
    method: "allowance",
  },
  {
    target: STRK_CONTRACT_ADDRESS,
    method: "approve",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
  },
  {
    target: STRK_CONTRACT_ADDRESS,
    method: "transfer",
  },
  {
    target: STRK_CONTRACT_ADDRESS,
    method: "mint",
  },
  {
    target: STRK_CONTRACT_ADDRESS,
    method: "burn",
  },
  {
    target: STRK_CONTRACT_ADDRESS,
    method: "allowance",
  },
  {
    target:
      "0x0305f26ad19e0a10715d9f3137573d3a543de7b707967cd85d11234d6ec0fb7e",
    method: "new_game",
  },
  {
    types: {
      StarknetDomain: [
        { name: "name", type: "shortstring" },
        { name: "version", type: "shortstring" },
        { name: "chainId", type: "shortstring" },
        { name: "revision", type: "shortstring" },
      ],
      Person: [
        { name: "name", type: "felt" },
        { name: "wallet", type: "felt" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "felt" },
      ],
    },
    primaryType: "Mail",
    domain: {
      name: "StarkNet Mail",
      version: "1",
      revision: "1",
      chainId: "SN_SEPOLIA",
    },
  },
];

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      chains={[sepolia]}
      connectors={[controller]}
      explorer={starkscan}
      provider={jsonRpcProvider({
        rpc: (chain: Chain) => {
          switch (chain) {
            case mainnet:
              return { nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET };
            case sepolia:
            default:
              return { nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA };
          }
        },
      })}
    >
      {children}
    </StarknetConfig>
  );
}

const controller = new ControllerConnector({
  policies,
  rpcUrl: rpc,
  url:
    process.env.NEXT_PUBLIC_KEYCHAIN_DEPLOYMENT_URL ??
    process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL,
  profileUrl:
    process.env.NEXT_PUBLIC_PROFILE_DEPLOYMENT_URL ??
    process.env.NEXT_PUBLIC_PROFILE_FRAME_URL,
  slot: "profile-example",
  preset: "eternum",
  namespace: "dopewars",
  tokens: {
    erc20: [
      // $LORDS
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
      // $FLIP
      // "0x01bfe97d729138fc7c2d93c77d6d1d8a24708d5060608017d9b384adf38f04c7",
    ],
  },
});
