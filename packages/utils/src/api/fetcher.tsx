
export function fetchDataCreator(url: string,
  options?: RequestInit["headers"],
) {
  return async <TData, TVariables>(query: string, variables?: TVariables): Promise<TData> => {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
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
};
