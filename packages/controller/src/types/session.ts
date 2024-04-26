import { BigNumberish, CairoCustomEnum, typedData } from "starknet";

export const sessionTypes = {
  StarknetDomain: [
    { name: "name", type: "shortstring" },
    { name: "version", type: "shortstring" },
    { name: "chainId", type: "shortstring" },
    { name: "revision", type: "shortstring" },
  ],
  "Allowed Method": [
    { name: "Contract Address", type: "ContractAddress" },
    { name: "selector", type: "selector" },
  ],
  Session: [
    { name: "Expires At", type: "timestamp" },
    { name: "Allowed Methods", type: "merkletree", contains: "Allowed Method" },
    { name: "Metadata", type: "string" },
    { name: "Session Key", type: "felt" },
  ],
};

export const ALLOWED_METHOD_HASH = typedData.getTypeHash(
  sessionTypes,
  "Allowed Method",
  typedData.TypedDataRevision.Active,
);

export interface AllowedMethod {
  "Contract Address": string;
  selector: string;
}

export interface OffChainSession {
  expires_at: BigNumberish;
  allowed_methods: AllowedMethod[];
  metadata: string;
  session_key_guid: BigNumberish;
}

export interface OnChainSession {
  expires_at: BigNumberish;
  allowed_methods_root: string;
  metadata_hash: string;
  session_key_guid: BigNumberish;
}

export interface SessionToken {
  session: OnChainSession;
  session_authorization: string[];
  session_signature: CairoCustomEnum;
  guardian_signature: CairoCustomEnum;
  proofs: string[][];
}
