import {
  ConnectReply,
  ExecuteReply,
  Policy,
  ConnectError,
} from "@cartridge/controller";
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
  | LogoutCtx
  | ExecuteCtx
  | SignMessageCtx
  | OpenMenuCtx
  | OpenSettingsCtx
  | SetDelegateCtx
  | SetExternalOwnerCtx;

export type ConnectCtx = {
  origin: string;
  type: "connect";
  policies: Policy[];
  resolve: (res: ConnectReply | ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type LogoutCtx = {
  origin: string;
  type: "logout";
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type ExecuteCtx = {
  origin: string;
  type: "execute";
  transactions: Call | Call[];
  abis?: Abi[];
  transactionsDetail?: InvocationsDetails & {
    chainId?: constants.StarknetChainId;
  };
  resolve: (res: ExecuteReply | ConnectError) => void;
  reject: (reason?: unknown) => void;
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

export type OpenMenuCtx = {
  origin: string;
  type: "open-menu";
  account: string;
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type OpenSettingsCtx = {
  origin: string;
  type: "open-settings";
  account: string;
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type SetDelegateCtx = {
  origin: string;
  type: "set-delegate";
  account: string;
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};

export type SetExternalOwnerCtx = {
  origin: string;
  type: "set-external-owner";
  account: string;
  resolve: (res: ConnectError) => void;
  reject: (reason?: unknown) => void;
};
