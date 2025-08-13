import React from "react";
import {
  ArgentColorIcon,
  BaseColorIcon,
  EthereumIcon,
  MetaMaskColorIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  SolanaColorIcon,
  SolanaIcon,
  StarknetColorIcon,
  StarknetIcon,
} from "@cartridge/ui";
import { NetworkWalletData } from "../types";
import { constants } from "starknet";

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
        // [
        //   "braavos",
        //   {
        //     name: "Braavos",
        //     type: "braavos", // need to update external wallet type
        //     icon: React.createElement(BraavosColorIcon),
        //     color: "#FF875B",
        //   },
        // ],
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
      wallets: new Map([
        [
          "rabby",
          {
            type: "rabby",
            name: "Rabby",
            icon: React.createElement(RabbyColorIcon),
          },
        ],
        [
          "metamask",
          {
            name: "MetaMask",
            type: "metamask",
            icon: React.createElement(MetaMaskColorIcon),
            color: "#E88A39",
          },
        ],
      ]),
    },
    {
      name: "Solana",
      platform: "solana",
      icon: React.createElement(SolanaColorIcon),
      subIcon: React.createElement(SolanaIcon),
      enabled: true,
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
        // ["solflare", {
        //   name: "Solflare",
        //   icon: React.createElement(SolflareColorIcon),
        //   color: "#AB9FF2",
        //   enabled: true,
        // }],
      ]),
    },
    {
      name: "Arbitrum",
      platform: "arbitrum",
      icon: null,
      subIcon: null,
      enabled: true,
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
      wallets: new Map([
        [
          "metamask",
          {
            name: "MetaMask",
            type: "metamask",
            icon: React.createElement(MetaMaskColorIcon),
            color: "#E88A39",
            enabled: true,
          },
        ],
      ]),
    },
  ],
};
