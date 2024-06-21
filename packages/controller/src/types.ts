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

export type Policy = {
  target: string;
  method?: string;
  description?: string;
};

export enum ResponseCodes {
  SUCCESS = "SUCCESS",
  NOT_CONNECTED = "NOT_CONNECTED",
  NOT_ALLOWED = "NOT_ALLOWED",
  CANCELED = "CANCELED",
}

export type ConnectError = {
  code: ResponseCodes;
  message: string;
};

export type ConnectReply = {
  code: ResponseCodes.SUCCESS;
  address: string;
  policies: Policy[];
};

export type ExecuteReply = InvokeFunctionResponse & {
  code: ResponseCodes.SUCCESS;
};

export type ProbeReply = {
  code: ResponseCodes.SUCCESS;
  address: string;
  policies: Policy[];
};

export interface Keychain {
  probe(): Promise<ProbeReply | ConnectError>;
  connect(
    policies: Policy[],
    rpcUrl: string,
  ): Promise<ConnectReply | ConnectError>;
  disconnect(): void;

  reset(): void;
  revoke(origin: string): void;

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
  ): Promise<ExecuteReply | ConnectError>;
  logout(): Promise<void>;
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

  username(): string;
}

export interface Modal {
  element: HTMLDivElement;
  open: () => void;
  close: () => void;
}

/**
 * Options for configuring the controller
 */
export type ControllerOptions = {
  /** The URL of keychain */
  url?: string;
  /** The URL of the RPC */
  rpc?: string;
  /** The origin of keychain */
  origin?: string;
  /** Paymaster options for transaction fee management */
  paymaster?: PaymasterOptions;
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
