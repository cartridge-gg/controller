import {
  DeployContractPayload,
  DeployContractResponse as StarknetDeployContractResponse,
  Abi,
  Call,
  InvocationsDetails,
  typedData,
  InvokeFunctionResponse,
  Signature,
} from "starknet";
import { BigNumberish } from "starknet/dist/utils/number";
import { BlockIdentifier } from "starknet/provider/utils";
import { EstimateFee } from "starknet/types/account"

export type Approvals = {
  [origin: string]: {
    scopes: Scope[];
    maxFee: BigNumberish;
  };
};

export type Scope = {
  target: string;
  method?: string;
};

export interface ProbeRequest extends RawRequest {
  method: "probe";
}

export interface ProbeResponse extends RawResponse {
  method: "probe";
  result?: {
    address?: string;
    scopes?: Scope[];
  };
}

export interface ConnectRequest extends RawRequest {
  method: "connect";
  params: {
    id: string;
    scopes: Scope[];
  };
}

export interface ConnectResponse extends RawResponse {
  method: "connect";
  result?: {
    success: boolean;
    address?: string;
    scopes: Scope[];
  };
}

export interface DeployContractRequest extends RawRequest {
  method: "deploy-contract";
  params: {
    id: string;
    payload: DeployContractPayload;
    abi?: Abi;
  };
}

export interface DeployContractResponse extends RawResponse {
  method: "deploy-contract";
  result?: StarknetDeployContractResponse;
}

export interface EstimateFeeRequest extends RawRequest {
  method: "estimate-fee";
  params: {
    calls: Call | Call[];
    nonce: BigNumberish;
    blockIdentifier?: BlockIdentifier;
  };
}

export interface EstimateFeeResponse extends RawResponse {
  method: "estimate-fee";
  result?: EstimateFee;
}

export interface ExecuteRequest extends RawRequest {
  method: "execute";
  params: {
    id?: string;
    calls: Call | Call[];
    abis?: Abi[];
    transactionsDetail?: InvocationsDetails;
  };
}

export interface ExecuteResponse extends RawResponse {
  method: "execute";
  result?: InvokeFunctionResponse;
  scopes?: Scope[];
}

export interface SignTransactionRequest extends RawRequest {
  method: "sign-transaction";
  params: {
    id: string;
    calls: Call | Call[];
    abis?: Abi[];
    transactionsDetail?: InvocationsDetails;
  };
}

export interface SignTransactionResponse extends RawResponse {
  method: "sign-transaction";
  result?: Signature;
}

export interface SignMessageRequest extends RawRequest {
  method: "sign-message";
  params: {
    id: string;
    account?: string;
    typedData: typedData.TypedData;
  };
}

export interface SignMessageResponse extends RawResponse {
  method: "sign-message";
  result?: Signature;
}

export interface RegisterRequest extends RawRequest {
  method: "register";
  params: {
    username: string;
    credential: { x: string, y: string };
  };
}

export interface RegisterResponse extends RawResponse {
  method: "register";
  result: {
    address: string;
    deviceKey: string;
  };
}

export type RawRequest = {
  origin?: string;
  method: string;
  params?: object | any[];
};

export type Request =
  | RawRequest
  | ProbeRequest
  | ConnectRequest
  | DeployContractRequest
  | EstimateFeeRequest
  | ExecuteRequest
  | SignMessageRequest
  | RegisterRequest;

export type RawResponse = {
  result?: any;
  error?: unknown;
};

export type Response =
  | RawResponse
  | ProbeResponse
  | DeployContractResponse
  | EstimateFeeResponse
  | ConnectResponse
  | SignMessageResponse
  | RegisterResponse;
