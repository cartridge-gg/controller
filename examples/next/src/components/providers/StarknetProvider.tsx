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
import {
  ETH_CONTRACT_ADDRESS,
  STRK_CONTRACT_ADDRESS,
} from "@cartridge/controller-ui/utils";

const MAINNET_RPC =
  process.env.NEXT_PUBLIC_RPC_MAINNET ??
  "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";
const SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_RPC_SEPOLIA ??
  "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9";
const KATANA_RPC = process.env.NEXT_PUBLIC_RPC_LOCAL ?? "http://localhost:5050";
const KATANA_CHAIN_ID =
  process.env.NEXT_PUBLIC_LOCAL_CHAIN_ID ?? "KATANA_LOCAL";

export enum ConnectOptions {
  DefaultChainId = "default-chain-id",
  OverridePolicies = "connect-override-policies",
  Preset = "connect-preset",
}
const overridePolicies =
  typeof window !== "undefined" &&
  window.localStorage.getItem(ConnectOptions.OverridePolicies) === "true";
const controllerPreset = (
  typeof window !== "undefined"
    ? window.localStorage.getItem(ConnectOptions.Preset)
    : null
) as keyof typeof presets;
console.log(
  `:: overridePolicies[${overridePolicies}] preset[${controllerPreset}]`,
);

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
    "0x01c3c8284d7EED443b42F47e764032a56eAf50A9079D67993B633930E3689814": {
      methods: [
        {
          name: "approve",
          entrypoint: "approve",
          amount: "50000000000000000000000",
        },
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
if (KATANA_RPC) {
  localKatanaChain = {
    id: num.toBigInt(shortString.encodeShortString(KATANA_CHAIN_ID)),
    network: KATANA_CHAIN_ID,
    name: KATANA_CHAIN_ID,
    rpcUrls: {
      default: {
        http: [KATANA_RPC],
      },
      public: {
        http: [KATANA_RPC],
      },
    },
    nativeCurrency: {
      name: "Starknet",
      symbol: "STRK",
      decimals: 18,
      address: STRK_CONTRACT_ADDRESS as `0x${string}`,
    },
    paymasterRpcUrls: {
      default: {
        http: [KATANA_RPC],
      },
      avnu: {
        http: [KATANA_RPC],
      },
    },
  };
}

const provider = jsonRpcProvider({
  rpc: (chain: Chain) => {
    if (chain.id === mainnet.id) {
      return { nodeUrl: MAINNET_RPC };
    }
    if (chain.id === sepolia.id) {
      return { nodeUrl: SEPOLIA_RPC };
    }
    if (chain.id === localKatanaChain?.id) {
      return { nodeUrl: KATANA_RPC };
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

const starknetConfigChains = [mainnet, sepolia, localKatanaChain].filter(
  Boolean,
) as Chain[];
const controllerConnectorChains = [
  {
    chainId: num.toHex(mainnet.id),
    rpcUrl: MAINNET_RPC,
  },
  {
    chainId: num.toHex(sepolia.id),
    rpcUrl: SEPOLIA_RPC,
  },
  localKatanaChain
    ? {
        chainId: num.toHex(localKatanaChain.id),
        rpcUrl: KATANA_RPC,
      }
    : undefined,
].filter(Boolean) as { chainId: string; rpcUrl: string }[];

// use previously selected chain id
let defaultChainId: string =
  (typeof window !== "undefined" &&
    window.localStorage.getItem(ConnectOptions.DefaultChainId)) ||
  "";
// if not available, use first in the list
if (
  !defaultChainId ||
  !controllerConnectorChains.find((c) => c.chainId === defaultChainId)
) {
  defaultChainId = controllerConnectorChains[0].chainId;
}
const defaultChainRpc = controllerConnectorChains.find(
  (c) => c.chainId === defaultChainId,
)?.rpcUrl;

console.log(
  `[available chains]:`,
  starknetConfigChains
    .map((c) => shortString.decodeShortString(num.toHex(c.id)))
    .join(", "),
  starknetConfigChains,
);
console.log(
  `[selected chain]:`,
  shortString.decodeShortString(defaultChainId),
  defaultChainRpc,
);

const signupOptions: AuthOptions = [
  "google",
  "webauthn",
  "discord",
  "walletconnect",
  "metamask",
  "password",
  "rabby",
  "phantom-evm",
  "sms",
];

export const presets = {
  none: {},
  nums: {
    // nums (achievements, quests)
    slot: "nums-mainnet",
    namespace: "NUMS",
    preset: "nums",
  },
  "loot-survivor": {
    // Loot Survivor (no achievements, no quests)
    namespace: "ls_0_0_9",
    slot: "pg-mainnet-10",
    preset: "loot-survivor",
  },
  summit: {
    // Summit (no achievements, no quests)
    namespace: "relayer_0_0_1",
    slot: "pg-mainnet-10",
    preset: "savage-summit",
  },
  pistols: {
    // Pistols (achievements, no quests)
    slot: "pistols-mainnet-2",
    namespace: "pistols",
    preset: "pistols",
  },
  cagecalls: {
    // slot: "cagecalls-mainnet",
    // namespace: "cagecalls",
    preset: "cage-calls",
  },
  "jokers-of-neon": {
    namespace: "jokers_of_neon_core",
    preset: "jokers-of-neon",
  },
};

export const controllerConnector = new ControllerConnector({
  // With the defaults, you can omit chains if you want to use:
  // - chains: [
  //     { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia/rpc/v0_9" },
  //     { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9" },
  //   ]
  //
  // However, if you want to use custom RPC URLs, you can still specify them:
  chains: controllerConnectorChains,
  // defaultChainId, // if not mainnet, only the original signer will be shown
  url: getKeychainUrl(),
  signupOptions,
  // By default, preset policies take precedence over manually provided policies
  // Set shouldOverridePresetPolicies to true if you want your policies to override preset
  shouldOverridePresetPolicies: overridePolicies,
  policies: overridePolicies ? policies : undefined,
  tokens: {
    erc20: ["lords", "strk"],
  },
  ...(controllerPreset ? presets[controllerPreset] : {}),
});

const session = new SessionConnector({
  shouldOverridePresetPolicies: overridePolicies,
  policies: overridePolicies ? policies : {},
  rpc: defaultChainRpc!,
  chainId: defaultChainId,
  redirectUrl: typeof window !== "undefined" ? window.location.origin : "",
  disconnectRedirectUrl: "redirect://",
  keychainUrl: getKeychainUrl(),
  apiUrl: process.env.NEXT_PUBLIC_CARTRIDGE_API_URL,
  signupOptions,
  ...(controllerPreset ? presets[controllerPreset] : {}),
});

export function StarknetProvider({ children }: PropsWithChildren) {
  return (
    <StarknetConfig
      autoConnect
      defaultChainId={BigInt(defaultChainId)}
      chains={starknetConfigChains}
      connectors={[controllerConnector, session]}
      explorer={cartridge}
      provider={provider}
    >
      {children}
    </StarknetConfig>
  );
}
