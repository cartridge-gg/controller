import { ErrorCode } from "@cartridge/controller-wasm/controller";
import {
  ConnectError,
  ConnectReply,
  DeployReply,
  ExecuteReply,
} from "@cartridge/controller";
import { Policies } from "@cartridge/presets";
import {
  Call,
  EstimateFeeResponseOverhead,
  Signature,
  TypedData,
} from "starknet";

export type ConnectionCtx =
  | ConnectCtx
  | DeployCtx
  | LogoutCtx
  | ExecuteCtx
  | SignMessageCtx
  | OpenSettingsCtx
  | OpenPurchaseCreditsCtx
  | OpenStarterPackCtx;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export type ExecuteCtx = {
  type: "execute";
  transactions: Call[];
  feeEstimate?: EstimateFeeResponseOverhead;
  error?: ControllerError;
  resolve?: (res: ExecuteReply | ConnectError) => void;
  reject?: (reason?: unknown) => void;
  onCancel?: () => void;
};

export type SignMessageCtx = {
  type: "sign-message";
  typedData: TypedData;
  account: string;
  resolve: (signature: Signature | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type OpenSettingsCtx = {
  type: "open-settings";
  account: string;
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type DeployCtx = {
  type: "deploy";
  account: string;
  resolve: (res: DeployReply | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type OpenPurchaseCreditsCtx = {
  type: "open-purchase-credits";
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type OpenStarterPackCtx = {
  type: "open-starter-pack";
  starterpackId: string;
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};
