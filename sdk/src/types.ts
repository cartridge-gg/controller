import {
  DeployContractPayload,
  Abi,
  Call,
  InvocationsDetails,
  typedData,
  AddTransactionResponse,
  Signature,
  Invocation,
  EstimateFeeResponse as StarknetEstimateFeeResponse,
} from "starknet";
import { BigNumberish } from "starknet/dist/utils/number";

export type Scopes = { [origin: string]: Scope[] };

export type Scope = {
  target: string;
  method?: string;
};

export interface ProbeRequest extends RawRequest {
  method: "probe";
  params: {
    scopes?: Scope[];
  };
}

export interface ProbeResponse extends RawRequest {
  method: "probe";
  result?: {
    address?: string;
  };
}

export interface ConnectRequest extends RawRequest {
  method: "connect";
  params: {
    scopes: Scope[];
  };
}

export interface ConnectResponse extends RawRequest {
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
    payload: DeployContractPayload;
    abi?: Abi;
  };
}

export interface DeployContractResponse extends RawResponse {
  method: "deploy-contract";
  result?: AddTransactionResponse;
}

export interface EstimateFeeRequest extends RawRequest {
  method: "estimate-fee";
  params: {
    invocation: Invocation;
  };
}

export interface EstimateFeeResponse extends RawResponse {
  method: "estimate-fee";
  result?: StarknetEstimateFeeResponse;
}

export interface ExecuteRequest extends RawRequest {
  method: "execute";
  params: {
    transactions: Call | Call[];
    abis?: Abi[];
    transactionsDetail?: InvocationsDetails;
  };
}

export interface ExecuteResponse extends RawResponse {
  method: "execute";
  result?: AddTransactionResponse;
}

export interface SignMessageRequest extends RawRequest {
  method: "sign-message";
  params: {
    typedData: typedData.TypedData;
  };
}

export interface SignMessageResponse extends RawResponse {
  method: "sign-message";
  result?: Signature;
}

export interface HashMessageRequest extends RawRequest {
  method: "hash-message";
  params: {
    typedData: typedData.TypedData;
  };
}

export interface HashMessageResponse extends RawResponse {
  method: "hash-message";
  result?: string;
}

export interface VerifyMessageRequest extends RawRequest {
  method: "verify-message";
  params: {
    typedData: typedData.TypedData;
    signature: Signature;
  };
}

export interface VerifyMessageResponse extends RawResponse {
  method: "verify-message";
  result?: boolean;
}

export interface VerifyMessageHashRequest extends RawRequest {
  method: "verify-message-hash";
  params: {
    hash: BigNumberish;
    signature: Signature;
  };
}

export interface VerifyMessageHashResponse extends RawResponse {
  method: "verify-message-hash";
  result?: boolean;
}

export interface GetNonceRequest extends RawRequest {
  method: "get-nonce";
}

export interface GetNonceResponse extends RawResponse {
  method: "get-nonce";
  result?: string;
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
  | HashMessageRequest
  | VerifyMessageHashRequest
  | VerifyMessageRequest
  | GetNonceRequest;

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
  | HashMessageResponse
  | VerifyMessageHashResponse
  | VerifyMessageResponse
  | GetNonceResponse;
