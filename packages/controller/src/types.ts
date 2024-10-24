import {
  constants,
  Abi,
  Call,
  InvocationsDetails,
  TypedData,
  InvokeFunctionResponse,
  Signature,
  EstimateFeeDetails,
  EstimateFee,
  DeclareContractPayload,
  BigNumberish,
  InvocationsSignerDetails,
  DeployAccountSignerDetails,
  DeclareSignerDetails,
} from "starknet";
import { KeychainIFrame, ProfileIFrame } from "./iframe";
import wasm from "@cartridge/account-wasm/controller";

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

export type Policy = wasm.Policy & {
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
  policies: Policy[];
};

export type ExecuteReply =
  | (InvokeFunctionResponse & {
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
    policies: Policy[],
    rpcUrl: string,
  ): Promise<ConnectReply | ConnectError>;
  disconnect(): void;

  reset(): void;
  revoke(origin: string): void;

  deploy(): Promise<DeployReply | ConnectError>;
  estimateDeclareFee(
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails,
  ): Promise<EstimateFee>;
  estimateInvokeFee(
    calls: Call | Call[],
    estimateFeeDetails?: EstimateFeeDetails,
  ): Promise<EstimateFee>;
  execute(
    calls: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails,
    sync?: boolean,
    paymaster?: PaymasterOptions,
    error?: ControllerError,
  ): Promise<ExecuteReply | ConnectError>;
  logout(): Promise<void>;
  openSettings(): Promise<void | ConnectError>;
  session(): Promise<Session>;
  sessions(): Promise<{
    [key: string]: Session;
  }>;
  signMessage(
    typedData: TypedData,
    account: string,
  ): Promise<Signature | ConnectError>;
  signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature>;
  signDeployAccountTransaction(
    transaction: DeployAccountSignerDetails,
  ): Promise<Signature>;
  signDeclareTransaction(transaction: DeclareSignerDetails): Promise<Signature>;
  delegateAccount(): string;
  username(): string;
  fetchControllers(contractAddresses: string[]): Promise<ControllerAccounts>;
}

export interface Profile {
  navigate(tab: ProfileContextTypeVariant): void;
}

export interface Modal {
  open: () => void;
  close: () => void;
}

/**
 * Options for configuring the controller
 */
export type ControllerOptions = KeychainOptions & ProfileOptions;

export type TokenOptions = {
  tokens: Tokens;
};

export type IFrameOptions = {
  /** The ID of the starter pack to use */
  starterPackId?: string;
  /** The theme to use */
  theme?: string;
  /** The color mode to use */
  colorMode?: ColorMode;
  /** Additional configuration options */
  config?: {
    /** Preset themes for the controller */
    presets?: ControllerThemePresets;
  };
};

export type KeychainOptions = IFrameOptions & {
  policies?: Policy[];
  /** The URL of keychain */
  url?: string;
  /** The URL of the RPC */
  rpc?: string;
  /** The origin of keychain */
  origin?: string;
  /** Paymaster options for transaction fee management */
  paymaster?: PaymasterOptions;
  /** Propagate transaction errors back to caller instead of showing modal */
  propagateSessionErrors?: boolean;
};

export type ProfileOptions = IFrameOptions & {
  /** The URL of profile. Mainly for internal development purpose */
  profileUrl?: string;
  /** The URL of Torii indexer. Will be mandatory once profile page is in production */
  indexerUrl?: string;
  /** The tokens to be listed on Inventory modal */
  tokens?: Tokens;
};

export type ProfileContextTypeVariant = "quest" | "inventory" | "history";

/**
 * Options for configuring a paymaster
 */
export type PaymasterOptions = {
  /**
   * The address of the account paying for the transaction.
   * This should be a valid Starknet address or "ANY_CALLER" short string.
   */
  caller: string;
  /**
   * The URL of the paymaster. Currently not used.
   */
  url?: string;
};

export type ColorMode = "light" | "dark";

export type ControllerTheme = {
  id: string;
  name: string;
  icon: string;
  cover: ThemeValue<string>;
  colorMode: ColorMode;
};

export type ControllerThemePresets = Record<string, ControllerThemePreset>;

export type ControllerThemePreset = Omit<ControllerTheme, "colorMode"> & {
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
  erc20?: ERC20[];
};

export type ERC20 = {
  address: string;
  logoUrl?: string;
};
