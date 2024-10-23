import { fetchDataCreator } from "../fetcher";
import { useIndexerAPI } from "../../hooks";

export function useFetchData<TData, TVariables>(
  query: string,
  options?: RequestInit["headers"],
): (variables?: TVariables) => Promise<TData> {
  const { url, headers } = useIndexerAPI();

  const fetchData = fetchDataCreator(url, {
    ...headers,
    ...options,
  });

  return (variables?: TVariables) => fetchData(query, variables);
}
