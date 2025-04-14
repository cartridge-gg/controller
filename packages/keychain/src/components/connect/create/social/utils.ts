export const doApiFetch = async (
  endpoint: string,
  body: Record<string, unknown>,
) => {
  const response = await fetch(
    `${import.meta.env.VITE_CARTRIDGE_API_URL}/oauth2/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorBody}`,
    );
  }
  return await response.json();
};
