import { createContext } from "react";
import {
  AuthExternalWallet,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "@cartridge/controller";
import { CredentialMetadata } from "@cartridge/controller-ui/utils/api/cartridge";
import { KeychainWallets } from "./keychain-wallets";

export interface WalletsContextValue {
  wallets: ExternalWallet[];
  supportedWalletsForAuth: AuthExternalWallet[];
  isLoading: boolean;
  isConnecting: boolean;
  error: Error | null;
  detectWallets: () => Promise<void>;
  connectWallet: (
    type: ExternalWalletType,
  ) => Promise<ExternalWalletResponse | null>;
  isExtensionMissing: (signer: CredentialMetadata) => boolean;
  switchChain: (
    identifier: ExternalWalletType,
    chainId: string,
  ) => Promise<boolean>;
  availableWallets: ExternalWalletType[];
}

declare global {
  interface Window {
    keychain_wallets?: KeychainWallets;
  }
}

export const WalletsContext = createContext<WalletsContextValue | undefined>(
  undefined,
);
