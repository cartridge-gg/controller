import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
} from "@cartridge/utils/api/cartridge";
import { fetchData } from "@/utils/graphql";

export function fetchAccount(username: string, signal?: AbortSignal) {
  return fetchData<AccountQuery, AccountQueryVariables>(
    AccountDocument,
    {
      username: username,
    },
    signal,
  );
}
