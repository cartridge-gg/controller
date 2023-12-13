import {
  constants,
  Abi,
  Call,
  InvocationsDetails,
  typedData,
  InvokeFunctionResponse,
  Signature,
  EstimateFeeDetails,
  EstimateFee,
  DeclareContractPayload,
  BigNumberish,
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
    typedData: typedData.TypedData,
    account: string,
  ): Promise<Signature | Error>;

  issueStarterPack(id: string): Promise<InvokeFunctionResponse>;
  showQuests(gameId: string): Promise<void>;
}

export interface Modal {
  element: HTMLDivElement;
  open: () => void;
  close: () => void;
}
