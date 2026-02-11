import {
  AuthOption,
  HeadlessUsernameLookupResult,
  IMPLEMENTED_AUTH_OPTIONS,
  LookupRequest,
  LookupResponse,
} from "./types";
import { constants, num } from "starknet";
import { API_URL } from "./constants";

const cache = new Map<string, string>();
const QUERY_URL = `${API_URL}/query`;

type LookupSigner = {
  isOriginal: boolean;
  isRevoked: boolean;
  metadata: {
    __typename: string;
    eip191?: Array<{
      provider: string;
      ethAddress: string;
    }> | null;
  };
};

type LookupSignersQueryResponse = {
  data?: {
    account?: {
      username: string;
      controllers?: {
        edges?: Array<{
          node?: {
            signers?: LookupSigner[] | null;
          } | null;
        } | null> | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

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

async function queryLookupSigners(
  username: string,
): Promise<LookupSignersQueryResponse> {
  const response = await fetch(QUERY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query LookupSigners($username: String!) {
          account(username: $username) {
            username
            controllers(first: 1) {
              edges {
                node {
                  signers {
                    isOriginal
                    isRevoked
                    metadata {
                      __typename
                      ... on Eip191Credentials {
                        eip191 {
                          provider
                          ethAddress
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { username },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

function normalizeProvider(provider: string): AuthOption | undefined {
  const normalized = provider.toLowerCase() as AuthOption;
  if (!HEADLESS_AUTH_OPTIONS.includes(normalized)) {
    return undefined;
  }
  return normalized;
}

const HEADLESS_AUTH_OPTIONS: AuthOption[] = [
  "google",
  "webauthn",
  "discord",
  "walletconnect",
  "password",
  "metamask",
  "rabby",
  "phantom-evm",
].filter((option) => IMPLEMENTED_AUTH_OPTIONS.includes(option));

function normalizeSignerOptions(
  signers: LookupSigner[] | undefined,
  chainId: string,
): AuthOption[] {
  if (!signers || signers.length === 0) {
    return [];
  }

  const isMainnet = chainId === constants.StarknetChainId.SN_MAIN;
  const available = signers.filter(
    (signer) => !signer.isRevoked && (isMainnet || signer.isOriginal),
  );

  const signerSet = new Set<AuthOption>();
  for (const signer of available) {
    switch (signer.metadata.__typename) {
      case "WebauthnCredentials":
        signerSet.add("webauthn");
        break;
      case "PasswordCredentials":
        signerSet.add("password");
        break;
      case "Eip191Credentials":
        signer.metadata.eip191?.forEach((entry) => {
          const provider = normalizeProvider(entry.provider);
          if (provider) {
            signerSet.add(provider);
          }
        });
        break;
      default:
        break;
    }
  }

  return HEADLESS_AUTH_OPTIONS.filter((option) => signerSet.has(option));
}

export async function lookupUsername(
  username: string,
  chainId: string,
): Promise<HeadlessUsernameLookupResult> {
  const response = await queryLookupSigners(username);
  if (response.errors?.length) {
    throw new Error(response.errors[0].message || "Lookup query failed");
  }

  const account = response.data?.account;
  if (!account) {
    return {
      username,
      exists: false,
      signers: [],
    };
  }

  const controller = account.controllers?.edges?.[0]?.node;
  const signers = normalizeSignerOptions(
    controller?.signers ?? undefined,
    chainId,
  );
  return {
    username: account.username,
    exists: true,
    signers,
  };
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
