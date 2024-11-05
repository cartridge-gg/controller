import { useCartridgeAPI } from "../../hooks";
import { fetchDataCreator } from "../fetcher";

export function useFetchData<TData, TVariables>(
  query: string,
  options?: RequestInit["headers"],
): (variables?: TVariables) => Promise<TData> {
  const { url, headers, credentials } = useCartridgeAPI();

  const fetchData = fetchDataCreator(url, credentials, {
    ...headers,
    ...options,
  });

  return (variables?: TVariables) => fetchData(query, variables);
}
