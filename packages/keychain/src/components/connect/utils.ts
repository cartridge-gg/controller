import {
  AccountDocument,
  AccountQuery,
  AccountQueryVariables,
} from "generated/graphql";
import { fetchData } from "hooks/fetcher";
import { AuthAction } from "./Authenticate";

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
    id: username,
  });
}

export function isIframe() {
  return typeof window !== "undefined" ? window.top !== window.self : false;
}
