"use client";

import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  jsonRpcProvider,
  StarknetConfig,
  starkscan,
} from "@starknet-react/core";
import { PropsWithChildren } from "react";
import ControllerConnector from "@cartridge/connector/controller";
import { SessionPolicies } from "@cartridge/controller";
import { constants, num, shortString } from "starknet";
import SessionConnector from "@cartridge/connector/session";

export const ETH_CONTRACT_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_CONTRACT_ADDRESS =
  "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D";

const messageForChain = (chainId: constants.StarknetChainId) => {
  return {
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
      chainId: chainId,
    },
  };
};

const policies: SessionPolicies = {
  contracts: {
    [ETH_CONTRACT_ADDRESS]: {
      methods: [
        {
          name: "approve",
          entrypoint: "approve",
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        { name: "transfer", entrypoint: "transfer" },
        { name: "mint", entrypoint: "mint" },
        { name: "burn", entrypoint: "burn" },
        { name: "allowance", entrypoint: "allowance" },
      ],
    },
    [STRK_CONTRACT_ADDRESS]: {
      methods: [
        {
          name: "approve",
          entrypoint: "approve",
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        { name: "transfer", entrypoint: "transfer" },
        { name: "mint", entrypoint: "mint" },
        { name: "burn", entrypoint: "burn" },
        { name: "allowance", entrypoint: "allowance" },
      ],
    },
    "0x0305f26ad19e0a10715d9f3137573d3a543de7b707967cd85d11234d6ec0fb7e": {
      methods: [{ name: "new_game", entrypoint: "new_game" }],
    },
  },
  messages: [
    messageForChain(constants.StarknetChainId.SN_MAIN),
    messageForChain(constants.StarknetChainId.SN_SEPOLIA),
  ],
};

// Configure RPC provider
const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    switch (chain) {
      case mainnet:
        return { nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET! };
      case sepolia:
        return { nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA! };
      case localKatana:
        return { nodeUrl: process.env.NEXT_PUBLIC_RPC_LOCAL! };
      default:
        return null;
    }
  },
});

const localKatana: Chain = {
  id: num.toBigInt(shortString.encodeShortString("KATANA")),
  network: "local",
  name: "Katana",
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_LOCAL!],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_LOCAL!],
    },
  },
  nativeCurrency: {
    name: "Starknet",
    symbol: "STRK",
    decimals: 18,
    address: STRK_CONTRACT_ADDRESS,
  },
};

const controller = new ControllerConnector({
  policies,
  chains: [
    {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_LOCAL!,
    },
    {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA!,
    },
    {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_MAINNET!,
    },
  ],
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
  url:
    process.env.NEXT_PUBLIC_KEYCHAIN_DEPLOYMENT_URL ??
    process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL,
  profileUrl:
    process.env.NEXT_PUBLIC_PROFILE_DEPLOYMENT_URL ??
    process.env.NEXT_PUBLIC_PROFILE_FRAME_URL,
  slot: "eternum",
  preset: "eternum",
  // namespace: "dopewars",
  tokens: {
    erc20: [
      "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49",
    ],
  },
});

const session = new SessionConnector({
  policies,
  rpc: process.env.NEXT_PUBLIC_RPC_SEPOLIA!,
  chainId: constants.StarknetChainId.SN_SEPOLIA,
  redirectUrl: typeof window !== "undefined" ? window.location.origin : "",
  keychainUrl: process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL,
});

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      chains={[mainnet, sepolia, localKatana]}
      connectors={[controller, session]}
      explorer={starkscan}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}
