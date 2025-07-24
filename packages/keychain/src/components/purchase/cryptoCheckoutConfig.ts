import {
  ArgentColorIcon,
  ArgentIcon,
  EthereumIcon,
  MetaMaskColorIcon,
  MetaMaskIcon,
  PhantomColorIcon,
  PhantomIcon,
  StarknetIcon,
  SolanaIcon,
} from "@cartridge/ui";

export const WALLET_CONFIG = {
  argent: {
    icon: ArgentIcon,
    colorIcon: ArgentColorIcon,
    network: "Starknet",
    networkIcon: StarknetIcon,
    bgColor: "#FF875B",
  },
  metamask: {
    icon: MetaMaskIcon,
    colorIcon: MetaMaskColorIcon,
    network: "Ethereum",
    networkIcon: EthereumIcon,
    bgColor: "#E88A39",
  },
  phantom: {
    icon: PhantomIcon,
    colorIcon: PhantomColorIcon,
    network: "Solana",
    networkIcon: SolanaIcon,
    bgColor: "#AB9FF2",
  },
} as const;

export enum CheckoutState {
  REVIEW_PURCHASE = 0,
  REQUESTING_PAYMENT = 1,
  TRANSACTION_SUBMITTED = 2,
}

export const CARTRIDGE_FEE = 0.025;
