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
  type,
}: {
  /**
   * The required policy types.
   * @example ["policyType1", "policyType2"]
   */
  requiredPolicyTypes: Array<string>;
  /**
   * The policy type to check.
   */
  type: Nullable<string>;
}): boolean => {
  if (!type) return false;
  return requiredPolicyTypes.includes(type);
};

type Nullable<T> = T | null | undefined;
