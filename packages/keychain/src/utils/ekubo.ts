import { Call, num } from "starknet";
import { USDC_CONTRACT_ADDRESS } from "@cartridge/ui/utils";

/**
 * Supported networks for Ekubo quotes
 */
export type EkuboNetwork = "mainnet" | "sepolia";

/**
 * Extended Error type with retry control
 */
interface ExtendedError extends Error {
  noRetry?: boolean;
}

/**
 * Ekubo Router contract addresses
 */
export const EKUBO_ROUTER_ADDRESSES = {
  mainnet: "0x0199741822c2dc722f6f605204f35e56dbc23bceed54818168c4c49e4fb8737e",
  sepolia: "0x0045f933adf0607292468ad1c1dedaa74d5ad166392590e72676a34d01d7b763",
} as const;

/**
 * USDC contract addresses by network
 */
export const USDC_ADDRESSES = {
  mainnet: USDC_CONTRACT_ADDRESS,
  sepolia: "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080",
} as const;

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

  // Normalize addresses to hex format (handles leading zeros properly)
  const normalizedTokenFrom = num.toHex(tokenFrom);
  const normalizedTokenTo = num.toHex(tokenTo);

  const url = `${baseUrl}/${receivedAmount}/${normalizedTokenFrom}/${normalizedTokenTo}`;

  console.log("Ekubo API URL:", url); // Debug log

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
          const error = new Error(data.error) as ExtendedError;
          // Mark insufficient liquidity errors as non-retryable
          if (data.error.includes("Insufficient liquidity")) {
            error.noRetry = true;
          }
          throw error;
        }

        return {
          impact: data.price_impact,
          total: parseTotalCalculated(data.total_calculated),
          splits: data.splits,
        };
      }

      // Check 404 responses for insufficient liquidity errors
      if (response.status === 404) {
        try {
          const data = (await response.json()) as SwapQuoteErrorResponse;
          if (data.error && data.error.includes("Insufficient liquidity")) {
            const error = new Error(data.error) as ExtendedError;
            error.noRetry = true;
            throw error;
          }
        } catch (e) {
          // If JSON parsing fails or no error message, fall through to generic error
          if ((e as ExtendedError).noRetry) {
            throw e; // Re-throw if it's our non-retryable error
          }
        }
        throw new Error(`Failed to fetch swap quote: 404 Not Found`);
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

      // Don't retry on non-retryable errors (e.g., insufficient liquidity)
      if ((error as ExtendedError).noRetry) {
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
  const usdcAddress = USDC_ADDRESSES[network];
  const quote = await fetchSwapQuote(
    amount,
    tokenAddress,
    usdcAddress,
    network,
    abortSignal,
  );
  return quote.total;
}

/**
 * Generate swap calls for Ekubo router
 *
 * Based on implementation from Provable Games:
 * https://github.com/Provable-Games/death-mountain/blob/23a296f710ca1e46be6a7c272e4fed09bb82e318/client/src/api/ekubo.ts
 *
 * @param purchaseToken - Token being sold/transferred
 * @param targetToken - Token being bought
 * @param minimumAmount - Minimum amount of target token to receive
 * @param quote - Quote from Ekubo API
 * @param network - Network to use (mainnet or sepolia)
 * @returns Array of calls to execute the swap
 */
export function generateSwapCalls(
  purchaseToken: string,
  targetToken: string,
  minimumAmount: bigint,
  quote: SwapQuote,
  network: EkuboNetwork = "mainnet",
): Call[] {
  const routerAddress = EKUBO_ROUTER_ADDRESSES[network];
  // Calculate total amount with slippage buffer
  let totalQuoteSum = quote.total < 0n ? -quote.total : quote.total;
  const doubledTotal = totalQuoteSum * 2n;
  totalQuoteSum =
    doubledTotal < totalQuoteSum + BigInt(1e19)
      ? doubledTotal
      : totalQuoteSum + BigInt(1e19);

  // Transfer tokens to router
  const transferCall: Call = {
    contractAddress: purchaseToken,
    entrypoint: "transfer",
    calldata: [routerAddress, num.toHex(totalQuoteSum), "0x0"],
  };

  // Clear profits after swap
  const clearCall: Call = {
    contractAddress: routerAddress,
    entrypoint: "clear",
    calldata: [purchaseToken],
  };

  // Return early if no valid quote
  if (!quote || quote.splits.length === 0) {
    return [transferCall, clearCall];
  }

  const { splits } = quote;

  // Clear minimum profits call
  const clearProfitsCall: Call = {
    contractAddress: routerAddress,
    entrypoint: "clear_minimum",
    calldata: [targetToken, num.toHex(minimumAmount), "0x0"],
  };

  let swapCalls: Call[];

  if (splits.length === 1) {
    // Single route swap
    const split = splits[0];

    const routeCalldata = split.route.reduce(
      (
        memo: { token: string; encoded: string[] },
        routeNode: RouteNode,
      ): { token: string; encoded: string[] } => {
        const isToken1 =
          BigInt(memo.token) === BigInt(routeNode.pool_key.token1);
        const nextToken = isToken1
          ? routeNode.pool_key.token0
          : routeNode.pool_key.token1;

        return {
          token: nextToken,
          encoded: memo.encoded.concat([
            routeNode.pool_key.token0,
            routeNode.pool_key.token1,
            routeNode.pool_key.fee,
            num.toHex(routeNode.pool_key.tick_spacing),
            routeNode.pool_key.extension,
            num.toHex(BigInt(routeNode.sqrt_ratio_limit) % 2n ** 128n),
            num.toHex(BigInt(routeNode.sqrt_ratio_limit) >> 128n),
            num.toHex(routeNode.skip_ahead),
          ]),
        };
      },
      {
        token: targetToken,
        encoded: [],
      },
    );

    const amountSpecified = BigInt(split.amount_specified);
    const absAmount = amountSpecified < 0n ? -amountSpecified : amountSpecified;

    swapCalls = [
      {
        contractAddress: routerAddress,
        entrypoint: "multihop_swap",
        calldata: [
          num.toHex(split.route.length),
          ...routeCalldata.encoded,
          targetToken,
          num.toHex(absAmount),
          "0x1",
        ],
      },
      clearProfitsCall,
    ];
  } else {
    // Multiple routes swap
    const multiRouteCalldata = splits.reduce(
      (memo: string[], split: SwapSplit): string[] => {
        const routeCalldata = split.route.reduce(
          (
            memo: { token: string; encoded: string[] },
            routeNode: RouteNode,
          ): { token: string; encoded: string[] } => {
            const isToken1 =
              BigInt(memo.token) === BigInt(routeNode.pool_key.token1);
            const nextToken = isToken1
              ? routeNode.pool_key.token0
              : routeNode.pool_key.token1;

            return {
              token: nextToken,
              encoded: memo.encoded.concat([
                routeNode.pool_key.token0,
                routeNode.pool_key.token1,
                routeNode.pool_key.fee,
                num.toHex(routeNode.pool_key.tick_spacing),
                routeNode.pool_key.extension,
                num.toHex(BigInt(routeNode.sqrt_ratio_limit) % 2n ** 128n),
                num.toHex(BigInt(routeNode.sqrt_ratio_limit) >> 128n),
                num.toHex(routeNode.skip_ahead),
              ]),
            };
          },
          {
            token: targetToken,
            encoded: [],
          },
        );

        const amountSpecified = BigInt(split.amount_specified);
        const absAmount =
          amountSpecified < 0n ? -amountSpecified : amountSpecified;

        return memo.concat([
          num.toHex(split.route.length),
          ...routeCalldata.encoded,
          targetToken,
          num.toHex(absAmount),
          "0x1",
        ]);
      },
      [],
    );

    swapCalls = [
      {
        contractAddress: routerAddress,
        entrypoint: "multi_multihop_swap",
        calldata: [num.toHex(splits.length), ...multiRouteCalldata],
      },
      clearProfitsCall,
    ];
  }

  return [transferCall, ...swapCalls, clearCall];
}
