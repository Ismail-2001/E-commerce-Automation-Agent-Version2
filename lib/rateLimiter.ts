/**
 * Simple token-bucket rate limiter for AI agent calls.
 * Prevents cost abuse from rapid-fire button clicks or chat spam.
 */

const DEFAULT_COOLDOWN_MS = 3000; // 3 seconds between calls

/**
 * In-memory rate limiter keyed by user identifier (or 'anonymous' if unauthenticated).
 * Tracks last-call timestamp per key.
 */
class RateLimiter {
  private lastCall = new Map<string, number>();

  /**
   * Checks if a call is allowed for the given key.
   * @param key - User identifier (e.g., auth user ID, or 'anonymous')
   * @param cooldownMs - Minimum ms between calls (default: 3000)
   * @returns true if allowed, false if rate-limited
   */
  canCall(key: string, cooldownMs: number = DEFAULT_COOLDOWN_MS): boolean {
    const now = Date.now();
    const last = this.lastCall.get(key) || 0;

    if (now - last < cooldownMs) {
      return false;
    }

    this.lastCall.set(key, now);
    return true;
  }

  /**
   * Gets remaining cooldown in ms for a key.
   * Returns 0 if no cooldown is active.
   */
  getRemainingCooldown(key: string, cooldownMs: number = DEFAULT_COOLDOWN_MS): number {
    const now = Date.now();
    const last = this.lastCall.get(key) || 0;
    const elapsed = now - last;
    return Math.max(0, cooldownMs - elapsed);
  }

  /**
   * Resets rate limit for a key (e.g., after successful auth upgrade).
   */
  reset(key: string): void {
    this.lastCall.delete(key);
  }

  /**
   * Resets all rate limits (for testing).
   */
  resetAll(): void {
    this.lastCall.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Hook-level debounce utility for UI components.
 * Wraps an async function to prevent double-calls.
 */
export function createDebouncer<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  cooldownMs: number = DEFAULT_COOLDOWN_MS
): (...args: TArgs) => Promise<TReturn | null> {
  let promise: Promise<TReturn> | null = null;
  let lastCall = 0;

  return async (...args: TArgs): Promise<TReturn | null> => {
    const now = Date.now();
    if (now - lastCall < cooldownMs) {
      return null; // Rate limited
    }

    lastCall = now;

    try {
      promise = fn(...args);
      return await promise;
    } finally {
      promise = null;
    }
  };
}
