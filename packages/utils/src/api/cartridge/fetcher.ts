import { useCartridgeAPI } from "../../hooks";
import { fetchDataCreator } from "../fetcher";

export function useFetchData<TData, TVariables>(
  query: string,
  options?: RequestInit["headers"],
): (variables?: TVariables) => Promise<TData> {
  const { url, headers } = useCartridgeAPI();

  const fetchData = fetchDataCreator(url, {
    ...headers,
    ...options,
  });

  return (variables?: TVariables) => fetchData(query, variables);
}
