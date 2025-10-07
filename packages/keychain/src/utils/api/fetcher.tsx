import { useCartridgeAPI } from "@cartridge/ui/utils";

export function fetchDataCreator(
  url: string,
  options?: {
    credentials?: RequestInit["credentials"];
    headers?: RequestInit["headers"];
  },
) {
  return async <TData, TVariables>(
    query: string,
    variables?: TVariables,
    signal?: AbortSignal,
  ): Promise<TData> => {
    const res = await fetch(url, {
      method: "POST",
      credentials: options?.credentials || "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      signal,
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];
      throw new Error(message);
    }

    return json.data;
  };
}

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
