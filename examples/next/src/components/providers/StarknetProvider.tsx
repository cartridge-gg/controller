"use client";

import ControllerConnector from "@cartridge/connector/controller";
import SessionConnector from "@cartridge/connector/session";
import { AuthOptions, SessionPolicies } from "@cartridge/controller";
import { Chain, mainnet, sepolia } from "@starknet-react/chains";
import {
  cartridge,
  jsonRpcProvider,
  StarknetConfig,
} from "@starknet-react/core";
import { PropsWithChildren } from "react";
import { constants, num, shortString } from "starknet";

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
          // amount: "0xffffffffffffffffffffffffffffffff",
          amount: "0x1774160BC6690000",
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        { name: "transfer", entrypoint: "transfer" },
        { name: "mint", entrypoint: "mint" },
        { name: "burn", entrypoint: "burn" },
      ],
    },
    [STRK_CONTRACT_ADDRESS]: {
      methods: [
        {
          name: "approve",
          entrypoint: "approve",
          amount: "0xffffffffffffffffffffffffffffffff",
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

let localKatanaChain: Chain | undefined = undefined;
if (process.env.NEXT_PUBLIC_RPC_LOCAL) {
  localKatanaChain = {
    id: num.toBigInt(shortString.encodeShortString("WP_SLOT")),
    network: "Slot",
    name: "Slot",
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_RPC_LOCAL],
      },
      public: {
        http: [process.env.NEXT_PUBLIC_RPC_LOCAL],
      },
    },
    nativeCurrency: {
      name: "Starknet",
      symbol: "STRK",
      decimals: 18,
      address: STRK_CONTRACT_ADDRESS,
    },
    paymasterRpcUrls: {
      default: {
        http: [],
      },
    },
  };
}

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    if (chain.id === mainnet.id && process.env.NEXT_PUBLIC_RPC_MAINNET) {
      return { nodeUrl: process.env.NEXT_PUBLIC_RPC_MAINNET };
    }
    if (chain.id === sepolia.id && process.env.NEXT_PUBLIC_RPC_SEPOLIA) {
      return { nodeUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA };
    }
    if (
      localKatanaChain &&
      chain.id === localKatanaChain.id &&
      process.env.NEXT_PUBLIC_RPC_LOCAL
    ) {
      return { nodeUrl: process.env.NEXT_PUBLIC_RPC_LOCAL };
    }
    return null;
  },
});

const getKeychainUrl = () => {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" &&
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF
  ) {
    let branchName: string;

    const url = window.location.href;
    const match = url.match(/git-([a-zA-Z0-9-]+)\.preview/);

    if (match && match[1]) {
      branchName = match[1];
    } else {
      branchName = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF.replace(
        /[^a-zA-Z0-9-]/g,
        "-",
      );
    }

    const keychainUrl = `https://keychain-git-${branchName}.preview.cartridge.gg/`;

    return keychainUrl;
  } else {
    return process.env.NEXT_PUBLIC_KEYCHAIN_FRAME_URL;
  }
};

const starknetConfigChains = [mainnet, sepolia].filter(Boolean) as Chain[];
if (localKatanaChain) {
  starknetConfigChains.push(localKatanaChain);
}

const controllerConnectorChains: { rpcUrl: string }[] = [];
if (process.env.NEXT_PUBLIC_RPC_SEPOLIA) {
  controllerConnectorChains.push({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_SEPOLIA,
  });
}
if (process.env.NEXT_PUBLIC_RPC_MAINNET) {
  controllerConnectorChains.push({
    rpcUrl: process.env.NEXT_PUBLIC_RPC_MAINNET,
  });
}
// if (process.env.NEXT_PUBLIC_RPC_LOCAL) {
//   controllerConnectorChains.unshift({
//     rpcUrl: process.env.NEXT_PUBLIC_RPC_LOCAL,
//   });
// }

const signupOptions: AuthOptions = [
  "google",
  "webauthn",
  "discord",
  "walletconnect",
  "metamask",
  "password",
  "rabby",
  "phantom-evm",
];

const controller = new ControllerConnector({
  policies,
  // With the defaults, you can omit chains if you want to use:
  // - chains: [
  //     { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" },
  //     { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
  //   ]
  //
  // However, if you want to use custom RPC URLs, you can still specify them:
  chains: controllerConnectorChains,
  url: getKeychainUrl(),
  signupOptions,
  slot: "arcade-pistols",
  namespace: "pistols",
  // By default, preset policies take precedence over manually provided policies
  // Set shouldOverridePresetPolicies to true if you want your policies to override preset
  // shouldOverridePresetPolicies: true,
  tokens: {
    erc20: ["lords", "strk"],
  },
});

const session = new SessionConnector({
  policies,
  rpc: process.env.NEXT_PUBLIC_RPC_MAINNET!,
  chainId: constants.StarknetChainId.SN_MAIN,
  redirectUrl: typeof window !== "undefined" ? window.location.origin : "",
  disconnectRedirectUrl: "whatsapp://",
  keychainUrl: getKeychainUrl(),
  apiUrl: process.env.NEXT_PUBLIC_CARTRIDGE_API_URL,
  signupOptions,
});

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      defaultChainId={mainnet.id}
      chains={starknetConfigChains}
      connectors={[controller, session]}
      explorer={cartridge}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}
