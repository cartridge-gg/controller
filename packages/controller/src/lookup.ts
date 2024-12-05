import { LookupRequest, LookupResponse } from "./types";
import { num } from "starknet";
import { API_URL } from "./constants";

const cache = new Map<string, string>();

async function lookup(request: LookupRequest): Promise<LookupResponse> {
  if (!request.addresses?.length && !request.usernames?.length) {
    return { results: [] };
  }

  const response = await fetch(`${API_URL}/lookup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function lookupUsernames(
  usernames: string[],
): Promise<Map<string, string>> {
  const uncachedUsernames = usernames.filter((name) => !cache.has(name));

  if (uncachedUsernames.length > 0) {
    const response = await lookup({ usernames: uncachedUsernames });

    response.results.forEach((result) => {
      cache.set(result.username, result.addresses[0]); // TODO: handle multiple controller addresses
    });
  }

  return new Map(
    usernames
      .map((name) => [name, cache.get(name)] as [string, string])
      .filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

export async function lookupAddresses(
  addresses: string[],
): Promise<Map<string, string>> {
  addresses = addresses.map(num.toHex);
  const uncachedAddresses = addresses.filter((addr) => !cache.has(addr));

  if (uncachedAddresses.length > 0) {
    const response = await lookup({
      addresses: uncachedAddresses,
    });

    response.results.forEach((result) => {
      cache.set(result.addresses[0], result.username); // TODO: handle multiple controller addresses
    });
  }

  return new Map(
    addresses
      .map((addr) => [addr, cache.get(addr)] as [string, string])
      .filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}
