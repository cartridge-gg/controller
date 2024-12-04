import {
  constants,
  BigNumberish,
  Call,
  Abi,
  InvocationsDetails,
} from "starknet";
import {
  AddInvokeTransactionResult,
  Signature,
  TypedData,
} from "@starknet-io/types-js";
import { KeychainIFrame, ProfileIFrame } from "./iframe";

export type Session = {
  chainId: constants.StarknetChainId;
  policies: Policy[];
  maxFee: BigNumberish;
  expiresAt: bigint;
  credentials: {
    authorization: string[];
    privateKey: string;
  };
};

/** The key must be the id */
export type VerifiedConfigs = Record<string, VerifiedConfig>;

export type VerifiedConfig = {
  origin: string | string[];
  policies?: SessionPolicies;
  theme?: ControllerTheme;
};

export type Policy = CallPolicy | TypedDataPolicy;

export type CallPolicy = {
  target: string;
  method: string;
  description?: string;
};

export type TypedDataPolicy = Omit<TypedData, "message">;

export type Policies = Policy[] | SessionPolicies;

export type SessionPolicies = {
  /** The key must be the contract address */
  contracts?: ContractPolicies;
  messages?: SignMessagePolicy[];
};

export type ContractPolicies = Record<string, ContractPolicy>;

export type ContractPolicy = {
  methods: Method[];
  description?: string;
};

export type Method = {
  name: string;
  entrypoint: string;
  description?: string;
};

export type SignMessagePolicy = TypedDataPolicy & {
  name: string;
  description?: string;
};

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
  policies: SessionPolicies;
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
};

export type DeployReply = {
  code: ResponseCodes.SUCCESS;
  transaction_hash: string;
};

export type IFrames = {
  keychain: KeychainIFrame;
  profile?: ProfileIFrame;
};

type ContractAddress = string;
type CartridgeID = string;
export type ControllerAccounts = Record<ContractAddress, CartridgeID>;

export interface Keychain {
  probe(rpcUrl: string): Promise<ProbeReply | ConnectError>;
  connect(
    policies: Policies,
    rpcUrl: string,
  ): Promise<ConnectReply | ConnectError>;
  disconnect(): void;

  reset(): void;
  revoke(origin: string): void;

  deploy(): Promise<DeployReply | ConnectError>;
  execute(
    calls: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
    sync?: boolean,
    paymaster?: any,
    error?: ControllerError,
  ): Promise<ExecuteReply | ConnectError>;
  signMessage(
    typedData: TypedData,
    account: string,
    async?: boolean,
  ): Promise<Signature | ConnectError>;
  logout(): Promise<void>;
  openSettings(): Promise<void | ConnectError>;
  session(): Promise<Session>;
  sessions(): Promise<{
    [key: string]: Session;
  }>;
  delegateAccount(): string;
  username(): string;
  fetchControllers(contractAddresses: string[]): Promise<ControllerAccounts>;
  openPurchaseCredits(): void;
  openExecute(): void;
}
export interface Profile {
  navigate(path: string): void;
}

export interface Modal {
  open: () => void;
  close: () => void;
}

/**
 * Options for configuring the controller
 */
export type ControllerOptions = ProviderOptions &
  KeychainOptions &
  ProfileOptions;

export type IFrameOptions = {
  /** The ID of the starter pack to use */
  starterPackId?: string;
  /** The theme to use */
  theme?: string;
  /** The color mode to use */
  colorMode?: ColorMode;
};

export type ProviderOptions = {
  /** The URL of the RPC */
  rpc: string;
};

export type KeychainOptions = IFrameOptions & {
  policies?: Policies;
  /** The URL of keychain */
  url?: string;
  /** The origin of keychain */
  origin?: string;
  /** Propagate transaction errors back to caller instead of showing modal */
  propagateSessionErrors?: boolean;
};

export type ProfileOptions = IFrameOptions & {
  /** The URL of profile. Mainly for internal development purpose */
  profileUrl?: string;
  /** The project name of Slot instance. */
  slot?: string;
  /** The namespace to use to fetch trophies data from indexer. Will be mandatory once profile page is in production */
  namespace?: string;
  /** The tokens to be listed on Inventory modal */
  tokens?: Tokens;
};

export type ProfileContextTypeVariant =
  | "inventory"
  | "trophies"
  | "achievements"
  | "activity";

export type ColorMode = "light" | "dark";

export type ControllerTheme = {
  name: string;
  icon: string;
  cover: ThemeValue<string>;
  colors?: ControllerColors;
};

export type ControllerColors = {
  primary?: ControllerColor;
  primaryForeground?: ControllerColor;
};

export type ControllerColor = ThemeValue<string>;

export type ThemeValue<T> = T | { dark: T; light: T };

export type Prefund = { address: string; min: string };

export type Tokens = {
  erc20?: string[];
};
