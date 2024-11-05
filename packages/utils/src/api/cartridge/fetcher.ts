import { useCartridgeAPI } from "../../hooks";
import { fetchDataCreator } from "../fetcher";

export function useFetchData<TData, TVariables>(
  query: string,
  options?: {
    credentials?: RequestInit["credentials"];
    headers?: RequestInit["headers"];
  },
): (variables?: TVariables) => Promise<TData> {
  const { url, credentials, headers } = useCartridgeAPI();

  const fetchData = fetchDataCreator(url, {
    credentials: options?.credentials || credentials,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  return (variables?: TVariables) => fetchData(query, variables);
}
