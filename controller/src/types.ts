import {
  constants,
  number,
  Abi,
  Call,
  InvocationsDetails,
  typedData,
  InvokeFunctionResponse,
  Signature,
  EstimateFeeDetails,
  EstimateFee,
  DeclareContractPayload,
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
  }
};

export type Session = {
  chainId: constants.StarknetChainId;
  policies: Policy[];
  maxFee: number.BigNumberish;
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

  estimateDeclareFee(payload: DeclareContractPayload, details?: EstimateFeeDetails & {
    chainId: constants.StarknetChainId
  }): Promise<EstimateFee>
  estimateInvokeFee(calls: Call | Call[], estimateFeeDetails?: EstimateFeeDetails & {
    chainId: constants.StarknetChainId
  }): Promise<EstimateFee>;
  execute(calls: Call | Call[], abis?: Abi[], transactionsDetail?: InvocationsDetails & {
    chainId?: constants.StarknetChainId,
  }, sync?: boolean): Promise<InvokeFunctionResponse>;
  provision(address: string, credentialId: string): Promise<string>;
  register(username: string, credentialId: string, credential: { x: string, y: string }): Promise<{ address: string, deviceKey: string }>;
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
