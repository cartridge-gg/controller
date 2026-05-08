import { useCartridgeAPI } from "../../hooks";
import { fetchDataCreator } from "../fetcher";

// Mirrors the key used by the keychain bearer-token util
// (packages/keychain/src/utils/bearer-token.ts). The token is written by
// the keychain after popup auth, and queries here need to attach it on
// every request so iframe contexts where the auth cookie is unavailable
// (Safari ITP) still authenticate. Read fresh per request — the token
// can appear/change after login without re-rendering the consumer.
const BEARER_TOKEN_KEY = "cartridge.bearerToken";

function getBearerToken(): string | null {
  try {
    return typeof window !== "undefined"
      ? window.localStorage.getItem(BEARER_TOKEN_KEY)
      : null;
  } catch {
    return null;
  }
}

export function useFetchData<TData, TVariables>(
  query: string,
  options?: {
    credentials?: RequestInit["credentials"];
    headers?: RequestInit["headers"];
  },
): (variables?: TVariables) => Promise<TData> {
  const { url, credentials, headers } = useCartridgeAPI();

  return async (variables?: TVariables) => {
    const bearerToken = getBearerToken();
    const fetchData = fetchDataCreator(url, {
      credentials: options?.credentials || credentials,
      headers: {
        ...headers,
        ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
        ...options?.headers,
      },
    });
    return fetchData(query, variables);
  };
}
