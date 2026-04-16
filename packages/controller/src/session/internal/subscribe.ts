import { SessionProtocolError, SessionTimeoutError } from "./errors";

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
  requestTimeoutMs: number = 15_000,
): Promise<SubscribeSessionResult> {
  const endpoint = `${cartridgeApiUrl.replace(/\/+$/, "")}/query`;
  const deadline = Date.now() + timeoutMs;

  let delay = 500;
  const MAX_DELAY = 5_000;

  while (Date.now() < deadline) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;

    const effectiveTimeout = Math.min(requestTimeoutMs, remainingMs);
    const controller =
      typeof AbortController !== "undefined"
        ? new AbortController()
        : undefined;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), effectiveTimeout)
      : undefined;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: SUBSCRIBE_QUERY,
          variables: { sessionKeyGuid },
        }),
        ...(controller ? { signal: controller.signal } : {}),
      });

      if (!response.ok) {
        // Retry on server errors (5xx, etc.)
        await sleep(Math.min(delay, deadline - Date.now()));
        delay = Math.min(delay * 2, MAX_DELAY);
        continue;
      }

      const json = (await response.json()) as {
        data?: { subscribeCreateSession?: SubscribeSessionResult | null };
        errors?: { message: string }[];
      };

      if (json.errors?.length) {
        // GraphQL errors are permanent (malformed query, validation failure).
        // Don't waste time retrying.
        const messages = json.errors.map((e) => e.message).join("; ");
        throw new SessionProtocolError(
          `Session subscription failed: ${messages}`,
        );
      }

      const session = json.data?.subscribeCreateSession;
      if (session) {
        return session;
      }

      // Session not ready yet — back off and retry
      await sleep(Math.min(delay, deadline - Date.now()));
      delay = Math.min(delay * 2, MAX_DELAY);
    } catch (e) {
      if (e instanceof SessionProtocolError || e instanceof SessionTimeoutError)
        throw e;
      // Network errors, aborts — retry
      await sleep(Math.min(delay, deadline - Date.now()));
      delay = Math.min(delay * 2, MAX_DELAY);
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }
  }

  throw new SessionTimeoutError("Timed out waiting for session creation");
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
