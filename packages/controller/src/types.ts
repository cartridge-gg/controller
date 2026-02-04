import { Policy, SessionPolicies } from "@cartridge/presets";
import {
  AddInvokeTransactionResult,
  ChainId,
  Signature,
  TypedData,
} from "@starknet-io/types-js";
import {
  Abi,
  BigNumberish,
  Call,
  constants,
  InvocationsDetails,
} from "starknet";
import { KeychainIFrame } from "./iframe";
import {
  AUTH_EXTERNAL_WALLETS,
  EXTERNAL_WALLETS,
  ExternalWallet,
  ExternalWalletResponse,
  ExternalWalletType,
} from "./wallets/types";

export type KeychainSession = {
  chainId: constants.StarknetChainId;
  policies: Policy[];
  maxFee: BigNumberish;
  expiresAt: bigint;
  credentials: {
    authorization: string[];
    privateKey: string;
  };
};

export const EMBEDDED_WALLETS = [
  "google",
  "webauthn",
  "discord",
  "walletconnect",
  "password",
] as const;

export type EmbeddedWallet = (typeof EMBEDDED_WALLETS)[number];

export const ALL_AUTH_OPTIONS = [
  ...EMBEDDED_WALLETS,
  ...EXTERNAL_WALLETS,
] as const;

export type AuthOption = (typeof ALL_AUTH_OPTIONS)[number];

export const IMPLEMENTED_AUTH_OPTIONS = [
  ...EMBEDDED_WALLETS,
  ...AUTH_EXTERNAL_WALLETS,
];

export type AuthOptions = (typeof IMPLEMENTED_AUTH_OPTIONS)[number][];

export enum ResponseCodes {
  SUCCESS = "SUCCESS",
  NOT_CONNECTED = "NOT_CONNECTED",
  ERROR = "ERROR",
  CANCELED = "CANCELED",
  USER_INTERACTION_REQUIRED = "USER_INTERACTION_REQUIRED",
}

export type ConnectError = {
  code: ResponseCodes;
  message: string;
  error?: ControllerError;
};

export type ControllerError = {
  code: Number;
  message: string;
  data?: any;
};

export type ConnectReply = {
  code: ResponseCodes.SUCCESS;
  address: string;
  policies?: SessionPolicies;
};

export type ExecuteReply =
  | (AddInvokeTransactionResult & {
      code: ResponseCodes.SUCCESS;
    })
  | {
      code: ResponseCodes.USER_INTERACTION_REQUIRED;
    };

export type ProbeReply = {
  code: ResponseCodes.SUCCESS;
  address: string;
  rpcUrl?: string;
};

export type DeployReply = {
  code: ResponseCodes.SUCCESS;
  transaction_hash: string;
};

export type IFrames = {
  keychain?: KeychainIFrame;
  version?: number;
};

export interface LookupRequest {
  usernames?: string[];
  addresses?: string[];
}

export interface LookupResult {
  username: string;
  addresses: string[];
}

export interface LookupResponse {
  results: LookupResult[];
}

export enum FeeSource {
  PAYMASTER = "PAYMASTER",
  CREDITS = "CREDITS",
}

type ContractAddress = string;
type CartridgeID = string;
export type ControllerAccounts = Record<ContractAddress, CartridgeID>;

export interface Keychain {
  probe(rpcUrl: string): Promise<ProbeReply | ConnectError>;
  connect(signupOptions?: AuthOptions): Promise<ConnectReply | ConnectError>;
  disconnect(): void;

  reset(): void;
  revoke(origin: string): void;

  deploy(): Promise<DeployReply | ConnectError>;
  execute(
    calls: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
    sync?: boolean,
    feeSource?: any,
    error?: ControllerError,
  ): Promise<ExecuteReply | ConnectError>;
  signMessage(
    typedData: TypedData,
    account: string,
    async?: boolean,
  ): Promise<Signature | ConnectError>;
  openSettings(): Promise<void | ConnectError>;
  session(): Promise<KeychainSession>;
  sessions(): Promise<{
    [key: string]: KeychainSession;
  }>;
  delegateAccount(): string;
  username(): string;
  openPurchaseCredits(): void;
  openExecute(calls: Call[]): Promise<void>;
  switchChain(rpcUrl: string): Promise<void>;
  openStarterPack(
    id: string | number,
    options?: StarterpackOptions,
  ): Promise<void>;
  navigate(path: string): Promise<void>;

  // External wallet methods
  externalDetectWallets(): Promise<ExternalWallet[]>;
  externalConnectWallet(
    type: ExternalWalletType,
    address?: string,
  ): Promise<ExternalWalletResponse>;
  externalSignMessage(
    type: ExternalWalletType,
    message: string,
  ): Promise<ExternalWalletResponse>;
  externalSignTypedData(
    type: ExternalWalletType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
  ): Promise<ExternalWalletResponse>;
  externalGetBalance(
    type: ExternalWalletType,
    tokenAddress?: string,
  ): Promise<ExternalWalletResponse>;
  externalSwitchChain(
    type: ExternalWalletType,
    chainId: string,
  ): Promise<boolean>;
}

export interface Profile {
  navigate(path: string): void;
  switchChain(rpcUrl: string): Promise<void>;
}

export interface Modal {
  open: () => void;
  close: () => void;
}

/**
 * Options for configuring the controller
 */
export type ControllerOptions = ProviderOptions & KeychainOptions;

export type IFrameOptions = {
  /** The ID of the starter pack to use */
  starterPackId?: string;
  /** The preset to use */
  preset?: string;
};

export type Chain = {
  rpcUrl: string;
};

export type ProviderOptions = {
  defaultChainId?: ChainId;
  chains?: Chain[];
};

export type KeychainOptions = IFrameOptions & {
  policies?: SessionPolicies;
  /** The URL of keychain */
  url?: string;
  /** The origin of keychain */
  origin?: string;
  /** The RPC URL to use (derived from defaultChainId) */
  rpcUrl?: string;
  /** Propagate transaction errors back to caller instead of showing modal */
  propagateSessionErrors?: boolean;
  /** How to display transaction/execution errors to the user ('modal' | 'notification' | 'silent'). Defaults to 'modal'. */
  errorDisplayMode?: "modal" | "notification" | "silent";
  /** The fee source to use for execute from outside */
  feeSource?: FeeSource;
  /** Signup options (the order of the options is reflected in the UI. It's recommended to group socials and wallets together ) */
  signupOptions?: AuthOptions;
  /** When true, manually provided policies will override preset policies. Default is false. */
  shouldOverridePresetPolicies?: boolean;
  /** The project name of Slot instance. */
  slot?: string;
  /** The namespace to use to fetch trophies data from indexer. Will be mandatory once profile page is in production */
  namespace?: string;
  /** The tokens to be listed on Inventory modal */
  tokens?: Tokens;
  /** When true, defer iframe mounting until connect() is called. Reduces initial load and resource fetching. */
  lazyload?: boolean;
};

export type ProfileContextTypeVariant =
  | "inventory"
  | "trophies"
  | "achievements"
  | "quests"
  | "leaderboard"
  | "activity";

export type Token = "eth" | "strk" | "lords" | "usdc" | "usdt";

export type Tokens = {
  erc20?: Token[];
};

export type OpenOptions = {
  /** The URL to redirect to after authentication (defaults to current page) */
  redirectUrl?: string;
};

export type StarterpackOptions = {
  /** The preimage to use */
  preimage?: string;
  /** Callback fired after the Play button closes the starterpack modal */
  onPurchaseComplete?: () => void;
};
