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
  InvocationsSignerDetails,
  DeployAccountSignerDetails,
  DeclareSignerDetails,
} from "starknet";
import { OffChainSession } from "./session";
export * from "./session";

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
};

export type ExecuteReply = InvokeFunctionResponse & {
  code: ResponseCodes.SUCCESS;
};

export type ProbeReply = {
  code: ResponseCodes.SUCCESS;
  address: string;
};

export interface Keychain {
  probe(): Promise<ProbeReply | Error>;
  connect(
    starterPackId?: string,
    chainId?: constants.StarknetChainId,
  ): Promise<ConnectReply | Error>;
  disconnect(): void;

  reset(): void;
  revoke(origin: string): void;
  approvals(origin: string): Promise<void>;

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
  session(): Promise<OffChainSession>;
  sessions(): Promise<{
    [key: string]: OffChainSession;
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
}

export interface Modal {
  element: HTMLDivElement;
  open: () => void;
  close: () => void;
}
