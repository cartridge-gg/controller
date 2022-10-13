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
