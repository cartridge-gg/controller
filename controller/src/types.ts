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
} from "starknet";
import { BigNumberish } from "starknet/utils/number";

export type Approvals = {
  scopes: Scope[];
  maxFee: BigNumberish;
};

export type Scope = {
  target: string;
  method?: string;
};

export interface Keychain {
  probe(): { address: string, scopes: Scope[] };
  connect(scopes: Scope[]): {
    address: string;
    scopes: Scope[];
  };
  disconnect(): void;
  estimateFee(calls: Call | Call[], estimateFeeDetails?: EstimateFeeDetails): Promise<EstimateFee>;
  execute(calls: Call | Call[], abis?: Abi[], transactionsDetail?: InvocationsDetails, sync?: boolean): Promise<InvokeFunctionResponse>;
  provision(address: string): Promise<string>;
  register(username: string, credential: { x: string, y: string }): Promise<{ address: string, deviceKey: string }>;

  signMessage(typedData: typedData.TypedData, account: string): Promise<Signature>;
  signTransaction(
    transactions: Call[],
    transactionsDetail: InvocationsSignerDetails,
    abis?: Abi[]
  ): Promise<Signature>;
}
