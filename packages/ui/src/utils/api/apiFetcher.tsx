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
    urlParams?: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<TData> => {
    return await doFetch<TData>(
      `${baseUrl}/${endpoint}`,
      options,
      body,
      urlParams,
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
  urlParams?: Record<string, string>,
  signal?: AbortSignal,
): Promise<TData> {
  let finalUrl = url;
  if (urlParams && Object.keys(urlParams).length > 0) {
    const params = new URLSearchParams(urlParams).toString();
    finalUrl += (url.includes("?") ? "&" : "?") + params;
  }

  const response = await fetch(finalUrl, {
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

  return json;
}
