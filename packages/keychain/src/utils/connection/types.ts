import { ErrorCode } from "@cartridge/account-wasm/controller";
import {
  ConnectReply,
  ExecuteReply,
  ConnectError,
  DeployReply,
} from "@cartridge/controller";
import { Policies } from "@cartridge/presets";
import {
  Abi,
  Call,
  InvocationsDetails,
  Signature,
  TypedData,
  constants,
} from "starknet";

export type ConnectionCtx =
  | ConnectCtx
  | DeployCtx
  | LogoutCtx
  | ExecuteCtx
  | SignMessageCtx
  | OpenSettingsCtx
  | OpenPurchaseCreditsCtx
  | undefined;

export type ConnectCtx = {
  origin: string;
  type: "connect";
  policies: Policies;
  resolve: (res: ConnectReply | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type LogoutCtx = {
  origin: string;
  type: "logout";
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type ControllerError = {
  code: ErrorCode;
  message: string;
  data?: any;
};

export type ExecuteCtx = {
  origin: string;
  type: "execute";
  transactions: Call | Call[];
  abis?: Abi[];
  transactionsDetail?: InvocationsDetails & {
    chainId?: constants.StarknetChainId;
  };
  error?: ControllerError;
  resolve?: (res: ExecuteReply | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel: () => void;
};

export type SignMessageCtx = {
  origin: string;
  type: "sign-message";
  typedData: TypedData;
  account: string;
  resolve: (signature: Signature | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type OpenSettingsCtx = {
  origin: string;
  type: "open-settings";
  account: string;
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type DeployCtx = {
  origin: string;
  type: "deploy";
  account: string;
  resolve: (res: DeployReply | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type OpenPurchaseCreditsCtx = {
  origin: string;
  type: "open-purchase-credits";
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};
