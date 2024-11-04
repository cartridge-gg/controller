import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
} from "@cartridge/utils/api/cartridge";
import { AuthAction } from "./Authenticate";
import { fetchData } from "utils/graphql";

export function validateUsernameFor(type: AuthAction) {
  return async (val: string) => {
    if (!val) {
      return "Username required";
    } else if (val.length < 3) {
      return "Username must be at least 3 characters";
    } else if (val.split(" ").length > 1) {
      return "Username cannot contain spaces";
    }

    if (type == "signup" && !/^[a-zA-Z0-9-]+$/.test(val)) {
      return "Username can only contain letters, numbers, and hyphens";
    }

    try {
      const data = await fetchAccount(val);

      if (type === "signup" && data.account) {
        return "Account already exists";
      }
    } catch (error) {
      switch (type) {
        case "signup": {
          if ((error as Error).message === "ent: account not found") {
            return;
          } else {
            return "An error occured.";
          }
        }
        case "login": {
          if ((error as Error).message === "ent: account not found") {
            return "Controller with username not found";
          } else {
            return "An error occured.";
          }
        }
      }
    }
  };
}

export function fetchAccount(username: string) {
  return fetchData<AccountQuery, AccountQueryVariables>(AccountDocument, {
    username: username,
  });
}
