const FEEDER_ENDPOINT = "https://alpha4.starknet.io/feeder_gateway";

// TODO: this should probably be supported by starknetjs
export const getClassByHash = async (hash: string): Promise<any> => {
  const raw = await get("get_class_by_hash", `classHash=${hash}`);
  return await raw.json();
};

function get(method: any, params: any): Promise<any> {
  const url = `${FEEDER_ENDPOINT}/${method}?${params}`;
  return fetch(url, { method: "GET" });
}
