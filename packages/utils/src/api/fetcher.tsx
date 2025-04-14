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
    return await doFetch<TData>(
      url,
      options,
      {
        query,
        variables,
      },
      signal,
    );
  };
}

export function fetchApiCreator(
  baseUrl: string,
  options?: {
    credentials?: RequestInit["credentials"];
    headers?: RequestInit["headers"];
  },
) {
  return async <TData,>(
    endpoint: string,
    body: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<TData> => {
    return await doFetch<TData>(
      `${baseUrl}/${endpoint}`,
      options,
      body,
      signal,
    );
  };
}

export async function doFetch<TData>(
  url: string,
  options?: {
    credentials?: RequestInit["credentials"];
    headers?: RequestInit["headers"];
  },
  body?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<TData> {
  const response = await fetch(url, {
    method: "POST",
    credentials: options?.credentials || "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    const { message } = json.errors[0];
    throw new Error(message);
  }

  return json.data;
}
