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
