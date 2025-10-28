import { USDC_CONTRACT_ADDRESS } from "@cartridge/ui/utils";

/**
 * Supported networks for Ekubo quotes
 */
export type EkuboNetwork = "mainnet" | "sepolia";

/**
 * Ekubo API Types
 */
export interface PoolKey {
  token0: string;
  token1: string;
  fee: string;
  tick_spacing: number;
  extension: string;
}

export interface RouteNode {
  pool_key: PoolKey;
  sqrt_ratio_limit: string;
  skip_ahead: number;
}

export interface SwapSplit {
  amount_specified: string;
  route: RouteNode[];
}

export interface SwapQuote {
  impact: number;
  total: bigint;
  splits: SwapSplit[];
}

interface SwapQuoteResponse {
  price_impact: number;
  total_calculated: string | number;
  splits: SwapSplit[];
}

interface SwapQuoteErrorResponse {
  error: string;
}

/**
 * Configuration for retry/backoff behavior
 */
const RETRY_CONFIG = {
  maxRetries: 5,
  baseBackoff: 500, // ms
  maxBackoffDelay: 5000, // ms
  timeout: 10000, // ms
};

/**
 * Parse Retry-After header (supports both seconds and HTTP-date formats)
 */
function parseRetryAfter(retryAfter: string | null): number | null {
  if (!retryAfter) return null;

  const trimmed = retryAfter.trim();
  if (!trimmed) return null;

  // Try parsing as seconds
  const seconds = parseInt(trimmed, 10);
  if (!isNaN(seconds) && seconds >= 0) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try parsing as HTTP date
  try {
    const date = new Date(trimmed);
    const delay = date.getTime() - Date.now();
    return delay > 0 ? delay : null;
  } catch {
    return null;
  }
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoffDelay(
  attempt: number,
  retryAfter: string | null,
): number {
  // If Retry-After header exists and is valid, use it
  const retryAfterDelay = parseRetryAfter(retryAfter);
  if (retryAfterDelay !== null && retryAfterDelay > 0) {
    return retryAfterDelay;
  }

  // Calculate exponential backoff
  const { baseBackoff, maxBackoffDelay } = RETRY_CONFIG;
  let delay = baseBackoff * Math.pow(2, attempt);
  if (delay > maxBackoffDelay) {
    delay = maxBackoffDelay;
  }

  // Add jitter (random value between delay/2 and delay)
  const minDelay = delay / 2;
  const jitter = Math.random() * (delay - minDelay);
  return minDelay + jitter;
}

/**
 * Sleep for a specified duration (ms)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse total_calculated from API response (handles string or number)
 * Returns absolute value since negative is just API convention for swap direction
 */
function parseTotalCalculated(totalCalculated: string | number): bigint {
  let value: bigint;
  if (typeof totalCalculated === "string") {
    value = BigInt(totalCalculated);
  } else {
    // For numbers, convert to string first to avoid precision loss
    value = BigInt(Math.floor(totalCalculated));
  }
  // Return absolute value - negative is just Ekubo's convention
  return value < 0n ? -value : value;
}

/**
 * Get the Ekubo API base URL for a given network
 */
function getEkuboApiUrl(network: EkuboNetwork): string {
  return `https://starknet-${network}-quoter-api.ekubo.org`;
}

/**
 * Fetch a swap quote from Ekubo API with retry logic
 */
export async function fetchSwapQuote(
  amount: bigint,
  tokenFrom: string,
  tokenTo: string,
  network: EkuboNetwork = "mainnet",
  abortSignal?: AbortSignal,
): Promise<SwapQuote> {
  // Negative amount to specify exact amount received
  const receivedAmount = `-${amount.toString()}`;
  const baseUrl = getEkuboApiUrl(network);
  const url = `${baseUrl}/${receivedAmount}/${tokenFrom}/${tokenTo}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    // Check if aborted before making request
    if (abortSignal?.aborted) {
      throw new Error("Request aborted");
    }

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: abortSignal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Success case
      if (response.ok) {
        const data = (await response.json()) as
          | SwapQuoteResponse
          | SwapQuoteErrorResponse;

        // Check for error response (e.g., insufficient liquidity)
        if ("error" in data) {
          throw new Error(data.error);
        }

        return {
          impact: data.price_impact,
          total: parseTotalCalculated(data.total_calculated),
          splits: data.splits,
        };
      }

      // Rate limited - retry with backoff
      if (response.status === 429) {
        // Don't retry on last attempt
        if (attempt === RETRY_CONFIG.maxRetries - 1) {
          throw new Error(`Rate limited (429) - max retries exceeded`);
        }

        const retryAfter = response.headers.get("Retry-After");
        const delay = calculateBackoffDelay(attempt, retryAfter);

        console.warn(
          `Rate limited (429), retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`,
        );

        await sleep(delay);
        continue;
      }

      // Other error status codes
      throw new Error(`Failed to fetch swap quote: ${response.status}`);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on abort
      if (error instanceof Error && error.name === "AbortError") {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === RETRY_CONFIG.maxRetries - 1) {
        break;
      }

      // For network errors, use exponential backoff
      const delay = calculateBackoffDelay(attempt, null);
      console.warn(
        `Request failed, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`,
        error,
      );

      await sleep(delay);
    }
  }

  throw lastError || new Error("Failed to fetch swap quote: unknown error");
}

/**
 * Fetch token price in USDC
 */
export async function fetchTokenPriceInUsdc(
  tokenAddress: string,
  amount: bigint,
  network: EkuboNetwork = "mainnet",
  abortSignal?: AbortSignal,
): Promise<bigint> {
  const quote = await fetchSwapQuote(
    amount,
    tokenAddress,
    USDC_CONTRACT_ADDRESS,
    network,
    abortSignal,
  );
  return quote.total;
}
