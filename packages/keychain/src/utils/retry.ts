/**
 * Retry utility with exponential backoff
 *
 * @param fn - The async function to retry
 * @param maxRetries - Maximum number of retries (default: 5)
 * @param baseDelay - Initial delay in ms (default: 200)
 * @param backoffMultiplier - Multiplier for each retry (default: 1.5)
 * @param maxDelay - Maximum delay between retries in ms (default: 1000)
 * @returns The result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 200,
  backoffMultiplier: number = 1.5,
  maxDelay: number = 1000,
): Promise<T> {
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

      // Wait before retrying
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }

      console.warn(
        `Retry attempt ${attempt + 1}/${maxRetries + 1} failed:`,
        lastError.message,
        `Retrying in ${delay}ms...`,
      );
    }
  }

  throw lastError!;
}
