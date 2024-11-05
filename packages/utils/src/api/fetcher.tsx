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
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];
      throw new Error(message);
    }

    return json.data;
  };
}
