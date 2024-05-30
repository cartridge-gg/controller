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

export type Assertion = {
  id: string;
  type: string;
  rawId: string;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  };
};

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
};

export enum ResponseCodes {
  SUCCESS = "SUCCESS",
  NOT_CONNECTED = "NOT_CONNECTED",
  NOT_ALLOWED = "NOT_ALLOWED",
  CANCELED = "CANCELED",
}

export type Error = {
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
  probe(): Promise<ProbeReply | Error>;
  connect(
    policies: Policy[],
    starterPackId?: string,
    chainId?: constants.StarknetChainId,
  ): Promise<ConnectReply | Error>;
  disconnect(): void;

  reset(): void;
  revoke(origin: string): void;
  approvals(origin: string): Promise<Session | undefined>;

  estimateDeclareFee(
    payload: DeclareContractPayload,
    details?: EstimateFeeDetails & {
      chainId: constants.StarknetChainId;
    },
  ): Promise<EstimateFee>;
  estimateInvokeFee(
    calls: Call | Call[],
    estimateFeeDetails?: EstimateFeeDetails & {
      chainId: constants.StarknetChainId;
    },
  ): Promise<EstimateFee>;
  execute(
    calls: Call | Call[],
    abis?: Abi[],
    transactionsDetail?: InvocationsDetails & {
      chainId?: constants.StarknetChainId;
    },
    sync?: boolean,
  ): Promise<ExecuteReply | Error>;
  provision(address: string, credentialId: string): Promise<string>;
  register(
    username: string,
    credentialId: string,
    credential: { x: string; y: string },
  ): Promise<{ address: string; deviceKey: string } | Error>;
  login(
    address: string,
    credentialId: string,
    options: {
      rpId?: string;
      challengeExt?: Buffer;
    },
  ): Promise<{ assertion: Assertion }>;
  logout(): Promise<void>;
  session(): Promise<Session>;
  sessions(): Promise<{
    [key: string]: Session;
  }>;
  signMessage(
    typedData: TypedData,
    account: string,
  ): Promise<Signature | Error>;
  signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[],
  ): Promise<Signature>;
  signDeployAccountTransaction(
    transaction: DeployAccountSignerDetails,
  ): Promise<Signature>;
  signDeclareTransaction(transaction: DeclareSignerDetails): Promise<Signature>;

  issueStarterPack(id: string): Promise<InvokeFunctionResponse>;
  showQuests(gameId: string): Promise<void>;

  username(): string;
}

export interface Modal {
  element: HTMLDivElement;
  open: () => void;
  close: () => void;
}

export type ControllerOptions = {
  url?: string;
  origin?: string;
  starterPackId?: string;
  chainId?: constants.StarknetChainId;
  theme?: string;
  colorMode?: ColorMode;
  config?: {
    presets?: ControllerThemePresets;
  };
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
