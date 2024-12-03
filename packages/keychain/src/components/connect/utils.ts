import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
} from "@cartridge/utils/api/cartridge";
import { fetchData } from "utils/graphql";

export async function validateUsernameFor(val: string) {
  if (!val) {
    throw new Error("Username required");
  } else if (val.length < 3) {
    throw new Error("Username must be at least 3 characters");
  } else if (val.split(" ").length > 1) {
    throw new Error("Username cannot contain spaces");
  }

  if (!/^[a-zA-Z0-9-]+$/.test(val)) {
    throw new Error("Username can only contain letters, numbers, and hyphens");
  }

  return await fetchAccount(val);
}

export function fetchAccount(username: string) {
  return fetchData<AccountQuery, AccountQueryVariables>(AccountDocument, {
    username: username,
  });
}
