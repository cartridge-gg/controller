export const useFetchData =
  <TData, TVariables>(
    query: string,
  ): ((variables?: TVariables) => Promise<TData>) =>
  (variables?: TVariables) =>
    fetchData(query, variables);

export async function fetchData<TData, TVariables>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_CARTRIDGE_API_URL}/query`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    },
  );

  const json = await res.json();

  if (json.errors) {
    const { message } = json.errors[0];
    throw new Error(message);
  }

  return json.data;
}
