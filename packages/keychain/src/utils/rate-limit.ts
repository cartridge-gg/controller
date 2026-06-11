export type RateLimitRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  sleep?: (delayMs: number, signal?: AbortSignal | null) => Promise<void>;
  random?: () => number;
};

const NON_IDEMPOTENT_RPC_METHODS = new Set([
  "starknet_addInvokeTransaction",
  "starknet_addDeclareTransaction",
  "starknet_addDeployAccountTransaction",
]);

export function createRateLimitedFetch(options?: RateLimitRetryOptions) {
  return localRateLimitedFetch(options);
}

function localRateLimitedFetch(options: RateLimitRetryOptions = {}) {
  const maxAttempts = options.maxAttempts ?? 4;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 8000;
  const sleep =
    options.sleep ??
    ((delay: number) => new Promise((r) => setTimeout(r, delay)));
  const random = options.random ?? Math.random;

  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const skipRetry = hasNonIdempotentJsonRpcMethod(init);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(input, init);
      const rateLimited =
        response.status === 429 || (await hasRateLimitJsonRpcError(response));

      if (!rateLimited || skipRetry || attempt + 1 >= maxAttempts) {
        return response;
      }

      const retryAfter = parseRetryAfter(
        response.headers?.get("Retry-After") ?? null,
      );
      const delay =
        retryAfter ??
        Math.floor(random() * Math.min(baseDelayMs * 2 ** attempt, maxDelayMs));
      await sleep(delay, init?.signal);
    }

    return fetch(input, init);
  }) as typeof fetch;
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const timestamp = Date.parse(value);
  if (!Number.isNaN(timestamp)) {
    return Math.max(0, timestamp - Date.now());
  }

  return null;
}

async function hasRateLimitJsonRpcError(response: Response) {
  if (!response.ok || typeof response.clone !== "function") {
    return false;
  }

  try {
    const body = await response.clone().json();
    const error = body?.error;
    if (!error) {
      return false;
    }
    const message = `${error.message ?? ""} ${error.data ?? ""}`.toLowerCase();
    return (
      error.code === -32005 ||
      message.includes("rate limit") ||
      message.includes("too many requests")
    );
  } catch {
    return false;
  }
}

function hasNonIdempotentJsonRpcMethod(init?: RequestInit): boolean {
  if (typeof init?.body !== "string") {
    return false;
  }

  try {
    const body = JSON.parse(init.body);
    const requests = Array.isArray(body) ? body : [body];
    return requests.some((request) =>
      NON_IDEMPOTENT_RPC_METHODS.has(request?.method),
    );
  } catch {
    return false;
  }
}
