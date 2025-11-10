import React from "react";
import {
  ArbitrumColorIcon,
  BaseColorIcon,
  EthereumColorIcon,
  EthereumIcon,
  MetaMaskColorIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  SolanaColorIcon,
  SolanaIcon,
  ArbitrumIcon,
  CoinbaseWalletColorIcon,
  OptimismColorIcon,
  OptimismIcon,
  StarknetColorIcon,
  StarknetIcon,
  ArgentColorIcon,
  BraavosColorIcon,
  ControllerColorIcon,
  MetaMaskIcon,
  RabbyIcon,
  CoinbaseWalletIcon,
  ArgentIcon,
  BraavosIcon,
  ControllerIcon,
  PhantomIcon,
} from "@cartridge/ui";
import { NetworkWalletData, Wallet } from "../types";
import { constants } from "starknet";
import { ExternalPlatform, ExternalWalletType } from "@cartridge/controller";

export const evmNetworks = [
  "ethereum",
  "base",
  "arbitrum",
  "optimism",
] as ExternalPlatform[];

const evmWallets = new Map<string, Wallet>([
  [
    "metamask",
    {
      name: "MetaMask",
      type: "metamask",
      icon: React.createElement(MetaMaskColorIcon),
      subIcon: React.createElement(MetaMaskIcon, { size: "xs" }),
      color: "#E88A39",
    },
  ],
  [
    "rabby",
    {
      type: "rabby",
      name: "Rabby",
      icon: React.createElement(RabbyColorIcon),
      subIcon: React.createElement(RabbyIcon, { size: "xs" }),
    },
  ],
  [
    "base",
    {
      type: "base",
      name: "Coinbase Wallet",
      icon: React.createElement(CoinbaseWalletColorIcon),
      subIcon: React.createElement(CoinbaseWalletIcon, { size: "xs" }),
    },
  ],
]);

const snWallets = new Map<string, Wallet>([
  [
    "controller",
    {
      name: "Controller",
      type: "controller",
      icon: React.createElement(ControllerColorIcon),
      subIcon: React.createElement(ControllerIcon, { size: "xs" }),
    },
  ],
  [
    "argent",
    {
      name: "Ready",
      type: "argent",
      icon: React.createElement(ArgentColorIcon),
      subIcon: React.createElement(ArgentIcon, { size: "xs" }),
      color: "#FF875B",
    },
  ],
  [
    "braavos",
    {
      name: "Braavos",
      type: "braavos",
      icon: React.createElement(BraavosColorIcon),
      subIcon: React.createElement(BraavosIcon, { size: "xs" }),
    },
  ],
]);

export const networkWalletData: NetworkWalletData = {
  networks: [
    {
      name: "Starknet",
      platform: "starknet",
      chains: [
        {
          chainId: constants.StarknetChainId.SN_MAIN,
          isMainnet: true,
        },
        {
          chainId: constants.StarknetChainId.SN_SEPOLIA,
          isMainnet: false,
        },
      ],
      icon: React.createElement(StarknetColorIcon),
      subIcon: React.createElement(StarknetIcon),
      wallets: snWallets,
    },
    {
      name: "Ethereum",
      platform: "ethereum",
      icon: React.createElement(EthereumColorIcon),
      subIcon: React.createElement(EthereumIcon),
      chains: [
        {
          chainId: "0x1",
          isMainnet: true,
        },
        {
          chainId: "0xaa36a7",
          isMainnet: false,
        },
      ],
      wallets: evmWallets,
    },
    {
      name: "Solana",
      platform: "solana",
      icon: React.createElement(SolanaColorIcon),
      subIcon: React.createElement(SolanaIcon),
      wallets: new Map([
        [
          "phantom",
          {
            name: "Phantom",
            type: "phantom",
            icon: React.createElement(PhantomColorIcon),
            subIcon: React.createElement(PhantomIcon),
            color: "#AB9FF2",
            enabled: true,
          },
        ],
      ]),
    },
    {
      name: "Base",
      platform: "base",
      chains: [
        {
          chainId: "0x2105",
          isMainnet: true,
        },
        {
          chainId: "0x14A34",
          isMainnet: false,
        },
      ],
      icon: React.createElement(BaseColorIcon),
      subIcon: React.createElement(EthereumIcon),
      wallets: evmWallets,
    },
    {
      name: "Arbitrum",
      platform: "arbitrum",
      icon: React.createElement(ArbitrumColorIcon),
      subIcon: React.createElement(ArbitrumIcon),
      chains: [
        {
          chainId: "0xA4B1",
          isMainnet: true,
        },
        {
          chainId: "0x66EEE",
          isMainnet: false,
        },
      ],
      wallets: evmWallets,
    },
    {
      name: "Optimism",
      platform: "optimism",
      icon: React.createElement(OptimismColorIcon),
      subIcon: React.createElement(OptimismIcon),
      chains: [
        {
          chainId: "0xA",
          isMainnet: true,
        },
        {
          chainId: "0xAA37DC",
          isMainnet: false,
        },
      ],
      wallets: evmWallets,
    },
  ],
};

export const getWallet = (
  type: ExternalWalletType | "controller" | "preimage",
) => {
  if (type === "preimage") {
    return {
      name: "Preimage",
      type: "preimage",
      icon: null,
      subIcon: null,
    };
  }

  const wallet = evmWallets.get(type) || snWallets.get(type);
  if (!wallet) {
    throw new Error(`Wallet ${type} not found`);
  }
  return wallet;
};
