import {
  Abi,
  Call,
  InvocationsDetails,
  typedData,
  InvokeFunctionResponse,
  Signature,
  InvocationsSignerDetails,
  EstimateFeeDetails,
  EstimateFee,
  DeclareSignerDetails,
  DeclareContractPayload,
  DeployAccountSignerDetails,
} from "starknet";
import { StarknetChainId } from "starknet/dist/constants";
import { BigNumberish } from "starknet/dist/utils/number";

export type Assertion = {
  id: string;
  type: string;
  rawId: string;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
  }
};

export type Session = {
  policies: Policy[];
  maxFee: BigNumberish;
};

export type Policy = {
  target: string;
  method?: string;
};

export interface Keychain {
  probe(): { address: string, policies: Policy[] };
  connect(policies: Policy[]): {
    address: string;
    policies: Policy[];
  };
  disconnect(): void;

  revoke(origin: string): void;
  approvals(origin: string): Promise<Session | undefined>;

  estimateDeclareFee(payload: DeclareContractPayload, details?: EstimateFeeDetails): Promise<EstimateFee>
  estimateInvokeFee(calls: Call | Call[], estimateFeeDetails?: EstimateFeeDetails): Promise<EstimateFee>;
  execute(calls: Call | Call[], abis?: Abi[], transactionsDetail?: InvocationsDetails & {
    chainId?: StarknetChainId,
  }, sync?: boolean): Promise<InvokeFunctionResponse>;
  provision(address: string): Promise<string>;
  register(username: string, credential: { x: string, y: string }): Promise<{ address: string, deviceKey: string }>;
  login(address: string, credentialId: string, options: {
    rpId?: string
    challengeExt?: Buffer
  }): Promise<{ assertion: Assertion }>
  logout(): Promise<void>;
  session(): Promise<Session>;
  sessions(): Promise<{
    [key: string]: Session;
  }>;

  signMessage(typedData: typedData.TypedData, account: string): Promise<Signature>;
}
