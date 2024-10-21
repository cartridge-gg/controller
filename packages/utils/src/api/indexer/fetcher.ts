import { useIndexerAPI } from "../../hooks";

export function useFetchData<TData, TVariables>(
  query: string,
  options?: RequestInit["headers"],
): (variables?: TVariables) => Promise<TData> {
  const { url, headers } = useIndexerAPI();

  return async (variables?: TVariables) => {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...headers,
        ...options,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];
      throw new Error(message);
    }

    return json.data;
  };
}
