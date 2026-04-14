import { useAuthStore } from '../stores/authStore';

describe('authStore', () => {
  it('initializes with null session and user', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.merchant).toBeNull();
  });

  it('sets loading to false after initialize when Supabase is not configured', async () => {
    // With empty VITE_SUPABASE_URL, initialize should skip and set loading=false
    await useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.loading).toBe(false);
  });

  it('clears error state', () => {
    // Manually set an error
    useAuthStore.setState({ error: 'Test error' });
    expect(useAuthStore.getState().error).toBe('Test error');
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('signOut clears all auth state', async () => {
    // Set some mock auth state
    useAuthStore.setState({
      user: { id: 'test' } as any,
      merchant: { id: 'merchant-1', name: 'Test', slug: 'test' },
    });
    await useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.merchant).toBeNull();
  });
});
