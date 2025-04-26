import type { ContractType } from "@/hooks/session";
import { fetchData } from "@/utils/graphql";
import {
  AccountDocument,
  type AccountQuery,
  type AccountQueryVariables,
} from "@cartridge/utils/api/cartridge";

export function fetchAccount(username: string, signal?: AbortSignal) {
  return fetchData<AccountQuery, AccountQueryVariables>(
    AccountDocument,
    {
      username: username,
    },
    signal,
  );
}

/**
 * Checks if the policy is required.
 * @param requiredPolicyTypes The required policy types.
 * @param type The policy type to check.
 * @returns True if the policy is required.
 */
export const isPolicyRequired = ({
  requiredPolicyTypes,
  policyType,
}: {
  /**
   * The required policy types.
   * @example ["policyType1", "policyType2"]
   */
  requiredPolicyTypes: Array<ContractType>;
  /**
   * The policy type to check.
   */
  policyType: Nullable<ContractType>;
}): boolean => {
  if (!policyType) return false;
  return requiredPolicyTypes.includes(policyType);
};

type Nullable<T> = T | null | undefined;

export enum AuthenticationStep {
  FillForm,
  ChooseSignupMethod,
}
