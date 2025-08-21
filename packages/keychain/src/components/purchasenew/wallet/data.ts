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
} from "@cartridge/ui";
import { NetworkWalletData, Wallet } from "../types";
import { constants } from "starknet";

const evmWallets = new Map<string, Wallet>([
  [
    "metamask",
    {
      name: "MetaMask",
      type: "metamask",
      icon: React.createElement(MetaMaskColorIcon),
      color: "#E88A39",
    },
  ],
  [
    "rabby",
    {
      type: "rabby",
      name: "Rabby",
      icon: React.createElement(RabbyColorIcon),
    },
  ],
  [
    "base",
    {
      type: "base",
      name: "Coinbase Wallet",
      icon: React.createElement(CoinbaseWalletColorIcon),
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
      wallets: new Map([
        [
          "argent",
          {
            name: "Argent",
            type: "argent",
            icon: React.createElement(ArgentColorIcon),
            color: "#FF875B",
          },
        ],
        [
          "braavos",
          {
            name: "Braavos",
            type: "braavos",
            icon: React.createElement(BraavosColorIcon),
          },
        ],
      ]),
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
