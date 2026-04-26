import { rateLimiter } from '../lib/rateLimiter';

describe('rateLimiter', () => {
  beforeEach(() => { rateLimiter.resetAll(); });

  it('allows first call for any key', () => {
    expect(rateLimiter.canCall('user-1')).toBe(true);
  });

  it('blocks rapid consecutive calls', () => {
    rateLimiter.canCall('user-1');
    expect(rateLimiter.canCall('user-1')).toBe(false);
  });

  it('allows calls for different keys independently', () => {
    rateLimiter.canCall('user-1');
    expect(rateLimiter.canCall('user-2')).toBe(true);
  });

  it('allows call after cooldown period', async () => {
    rateLimiter.canCall('user-1', 100);
    expect(rateLimiter.canCall('user-1', 100)).toBe(false);
    await new Promise((r) => setTimeout(r, 110));
    expect(rateLimiter.canCall('user-1', 100)).toBe(true);
  });

  it('reports remaining cooldown correctly', () => {
    rateLimiter.canCall('user-1', 1000);
    const remaining = rateLimiter.getRemainingCooldown('user-1', 1000);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(1000);
  });

  it('resets rate limit for a key', () => {
    rateLimiter.canCall('user-1');
    rateLimiter.reset('user-1');
    expect(rateLimiter.canCall('user-1')).toBe(true);
  });
});
