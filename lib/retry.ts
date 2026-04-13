/**
 * Retry utility with exponential backoff and jitter.
 * Used for resilient AI API calls.
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  jitter: true,
};

/**
 * Executes an async function with retry logic.
 * @param fn - The async function to execute
 * @param options - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = DEFAULT_OPTIONS.maxRetries,
  baseDelayMs: number = DEFAULT_OPTIONS.baseDelayMs
): Promise<T> {
  const options: Required<RetryOptions> = {
    ...DEFAULT_OPTIONS,
    maxRetries,
    baseDelayMs,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < options.maxRetries) {
        const delay = Math.min(
          options.maxDelayMs,
          options.baseDelayMs * Math.pow(2, attempt)
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = options.jitter
          ? delay * (0.5 + Math.random() * 0.5)
          : delay;

        await sleep(jitteredDelay);
      }
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
