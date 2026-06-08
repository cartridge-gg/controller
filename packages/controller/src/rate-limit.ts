export type RateLimitRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  maxRetryAfterMs?: number;
  sleep?: (delayMs: number, signal?: AbortSignal | null) => Promise<void>;
  random?: () => number;
};

export const DEFAULT_RATE_LIMIT_RETRY_OPTIONS = {
  maxAttempts: 4,
  baseDelayMs: 500,
  maxDelayMs: 8000,
  maxRetryAfterMs: 60000,
} as const;

const cooldowns = new Map<string, number>();
const NON_IDEMPOTENT_RPC_METHODS = new Set([
  "starknet_addInvokeTransaction",
  "starknet_addDeclareTransaction",
  "starknet_addDeployAccountTransaction",
]);

type FetchLike = typeof fetch;

export function createRateLimitedFetch(
  options: RateLimitRetryOptions = {},
  baseFetch?: FetchLike,
): FetchLike {
  const config = {
    ...DEFAULT_RATE_LIMIT_RETRY_OPTIONS,
    ...options,
  };
  const sleep = options.sleep ?? sleepWithAbort;
  const random = options.random ?? Math.random;

  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const signal =
      init?.signal ?? (input instanceof Request ? input.signal : null);
    const key = requestKey(input);
    const skipRetry = hasNonIdempotentJsonRpcMethod(init);

    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
      await waitForCooldown(key, sleep, signal);

      let response: Response;
      try {
        response = await resolveFetch(baseFetch)(input, init);
      } catch (error) {
        if (skipRetry || isAbortError(error) || !isRateLimitLikeError(error)) {
          throw error;
        }

        if (attempt + 1 >= config.maxAttempts) {
          throw error;
        }

        await sleep(backoffDelay(config, attempt, null, random), signal);
        continue;
      }

      const retryAfter = parseRetryAfter(
        response.headers?.get("Retry-After") ?? null,
      );
      const rateLimited =
        response.status === 429 || (await hasRateLimitJsonRpcError(response));

      if (!rateLimited || skipRetry || attempt + 1 >= config.maxAttempts) {
        return response;
      }

      const delay = backoffDelay(config, attempt, retryAfter, random);
      cooldowns.set(key, Date.now() + delay);
      await sleep(delay, signal);
      cooldowns.delete(key);
    }

    return resolveFetch(baseFetch)(input, init);
  }) as FetchLike;
}

export function parseRetryAfter(value: string | null): number | null {
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

function backoffDelay(
  config: Required<Omit<RateLimitRetryOptions, "sleep" | "random">>,
  attempt: number,
  retryAfterMs: number | null,
  random: () => number,
): number {
  const retryAfter =
    retryAfterMs === null
      ? null
      : Math.min(retryAfterMs, config.maxRetryAfterMs);
  if (retryAfter !== null) {
    return retryAfter;
  }

  const exponential = Math.min(
    config.baseDelayMs * 2 ** attempt,
    config.maxDelayMs,
  );
  return Math.floor(random() * exponential);
}

async function hasRateLimitJsonRpcError(response: Response): Promise<boolean> {
  if (!response.ok) {
    return false;
  }

  try {
    if (typeof response.clone !== "function") {
      return false;
    }

    const body = await response.clone().json();
    const error = body?.error;
    if (!error) {
      return false;
    }

    return (
      error.code === -32005 ||
      isRateLimitLikeMessage(error.message) ||
      isRateLimitLikeMessage(error.data)
    );
  } catch {
    return false;
  }
}

function isRateLimitLikeError(error: unknown): boolean {
  return (
    error instanceof Error &&
    isRateLimitLikeMessage(`${error.name} ${error.message}`)
  );
}

function isRateLimitLikeMessage(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const message = value.toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  );
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function requestKey(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

function resolveFetch(baseFetch?: FetchLike): FetchLike {
  return baseFetch ?? fetch.bind(globalThis);
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

async function waitForCooldown(
  key: string,
  sleep: Required<RateLimitRetryOptions>["sleep"],
  signal?: AbortSignal | null,
) {
  const until = cooldowns.get(key) ?? 0;
  const delay = until - Date.now();
  if (delay > 0) {
    await sleep(delay, signal);
  }
}

function sleepWithAbort(delayMs: number, signal?: AbortSignal | null) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("Aborted", "AbortError"));
  }

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, delayMs);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}
