import {
  ContractPolicy,
  Method,
  SessionPolicies,
  SignMessagePolicy,
} from "@cartridge/presets";

export type ParsedSessionPolicies = {
  verified: boolean;
  contracts?: SessionContracts;
  messages?: SessionMessages;
};

export type SessionContracts = Record<
  string,
  Omit<ContractPolicy, "methods"> & {
    methods: (Method & { authorized?: boolean })[];
  }
>;

export type SessionMessages = (SignMessagePolicy & {
  authorized?: boolean;
})[];

export function parsePolicies(
  policies: SessionPolicies,
): ParsedSessionPolicies {
  return {
    verified: false,
    contracts: policies.contracts
      ? Object.fromEntries(
          Object.entries(policies.contracts).map(([address, contract]) => [
            address,
            {
              ...contract,
              methods: contract.methods.map((method) => ({
                ...method,
                authorized: true,
              })),
            },
          ]),
        )
      : undefined,
    messages: policies.messages?.map((message) => ({
      ...message,
      authorized: true,
    })),
  };
}
