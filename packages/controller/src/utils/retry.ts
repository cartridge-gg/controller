/**
 * Retry utility for waitForTransaction operations
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export interface RetryableFunction<T> {
  (): Promise<T>;
}

/**
 * Retries a function with exponential backoff
 * @param fn The function to retry
 * @param options Retry configuration options
 * @returns Promise that resolves with the function result or rejects with the last error
 */
export async function retryWithBackoff<T>(
  fn: RetryableFunction<T>,
  options: RetryOptions,
): Promise<T> {
  const {
    maxRetries,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error;
  let delay = baseDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // If this is the last attempt, don't wait and rethrow
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying (except on first attempt)
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }

      console.warn(
        `waitForTransaction attempt ${attempt + 1}/${maxRetries + 1} failed:`,
        lastError.message,
        `Retrying in ${delay}ms...`,
      );
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript requires it
  throw lastError!;
}

/**
 * Wraps waitForTransaction calls with retry logic
 * @param waitForTransactionFn The original waitForTransaction function
 * @param txHash Transaction hash
 * @param timeoutMs Timeout in milliseconds
 * @param maxRetries Maximum number of retries (default: 5)
 * @returns Promise that resolves with the transaction result
 */
export async function waitForTransactionWithRetry<T>(
  waitForTransactionFn: (txHash: string, timeoutMs?: number) => Promise<T>,
  txHash: string,
  timeoutMs?: number,
  maxRetries: number = 5,
): Promise<T> {
  return retryWithBackoff(() => waitForTransactionFn(txHash, timeoutMs), {
    maxRetries,
    baseDelay: 2000, // Start with 2 second delay
    maxDelay: 30000, // Max 30 second delay
    backoffMultiplier: 1.5, // Moderate backoff
  });
}
