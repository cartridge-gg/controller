import React from "react";
import {
  ArgentColorIcon,
  BraavosColorIcon,
  EthereumColorIcon,
  MetaMaskColorIcon,
  PhantomColorIcon,
  RabbyColorIcon,
  SolanaColorIcon,
  SolflareColorIcon,
  StarknetColorIcon,
} from "@cartridge/ui";
import { NetworkWalletData } from "./types";

export const networkWalletData: NetworkWalletData = {
  networks: [
    {
      id: "starknet",
      name: "Starknet",
      icon: React.createElement(StarknetColorIcon),
      wallets: [
        {
          id: "argent",
          name: "Argent",
          icon: React.createElement(ArgentColorIcon),
        },
        {
          id: "braavos",
          name: "Braavos",
          icon: React.createElement(BraavosColorIcon),
        },
      ],
    },
    {
      id: "ethereum",
      name: "Ethereum",
      icon: React.createElement(EthereumColorIcon),
      wallets: [
        {
          id: "rabby",
          name: "Rabby",
          icon: React.createElement(RabbyColorIcon),
        },
        {
          id: "metamask",
          name: "MetaMask",
          icon: React.createElement(MetaMaskColorIcon),
        },
      ],
    },
    {
      id: "solana",
      name: "Solana",
      icon: React.createElement(SolanaColorIcon),
      wallets: [
        {
          id: "phantom",
          name: "Phantom",
          icon: React.createElement(PhantomColorIcon),
        },
        {
          id: "solflare",
          name: "Solflare",
          icon: React.createElement(SolflareColorIcon),
        },
      ],
    },
    // {
    //   id: "base",
    //   name: "Base",
    //   icon: React.createElement(BaseColorIcon),
    //   wallets: [
    //     {
    //       id: "coinbase",
    //       name: "Coinbase Wallet",
    //       icon: React.createElement(WalletIcon)
    //     },
    //     {
    //       id: "metamask-base",
    //       name: "MetaMask",
    //       icon: React.createElement(WalletIcon)
    //     }
    //   ]
    // }
  ],
};
