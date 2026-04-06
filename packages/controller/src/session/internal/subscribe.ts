import { SessionTimeoutError } from "./errors";

export interface SubscribeSessionResult {
  authorization: string[];
  expiresAt: string;
  controller: {
    accountID: string;
    address: string;
  };
}

const SUBSCRIBE_QUERY = `
  query SubscribeCreateSession($sessionKeyGuid: Felt!) {
    subscribeCreateSession(sessionKeyGuid: $sessionKeyGuid) {
      authorization
      expiresAt
      controller {
        accountID
        address
      }
    }
  }
`;

/**
 * Polls the Cartridge GraphQL API waiting for a session to be created.
 * Replaces the WASM `subscribeCreateSession` function.
 */
export async function subscribeCreateSession(
  sessionKeyGuid: string,
  cartridgeApiUrl: string,
  timeoutMs: number = 180_000,
): Promise<SubscribeSessionResult> {
  const endpoint = `${cartridgeApiUrl.replace(/\/+$/, "")}/query`;
  const deadline = Date.now() + timeoutMs;

  let delay = 500;
  const MAX_DELAY = 5_000;

  while (Date.now() < deadline) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: SUBSCRIBE_QUERY,
        variables: { sessionKeyGuid },
      }),
    });

    if (!response.ok) {
      // Retry on server errors
      await sleep(delay);
      delay = Math.min(delay * 2, MAX_DELAY);
      continue;
    }

    const json = (await response.json()) as {
      data?: { subscribeCreateSession?: SubscribeSessionResult | null };
      errors?: { message: string }[];
    };

    if (json.errors?.length) {
      // Retry on GraphQL errors
      await sleep(delay);
      delay = Math.min(delay * 2, MAX_DELAY);
      continue;
    }

    const session = json.data?.subscribeCreateSession;
    if (session) {
      return session;
    }

    // Session not ready yet — back off and retry
    await sleep(delay);
    delay = Math.min(delay * 2, MAX_DELAY);
  }

  throw new SessionTimeoutError("Timed out waiting for session creation");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
