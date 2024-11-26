import { fetchDataCreator } from "../fetcher";
import { useIndexerAPI } from "../../hooks";

export function useFetchData<TData, TVariables>(
  query: string,
  options?: {
    credentials?: RequestInit["credentials"];
    headers?: RequestInit["headers"];
  },
): (variables?: TVariables) => Promise<TData> {
  const { indexerUrl, credentials, headers } = useIndexerAPI();
  if (!indexerUrl) {
    return () => Promise.reject("Indexer API is not ready");
  }

  const fetchData = fetchDataCreator(indexerUrl, {
    credentials: options?.credentials ?? credentials,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  return (variables?: TVariables) => fetchData(query, variables);
}
