import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Merchant {
  id: string;
  name: string;
  slug: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  merchant: Merchant | null;
  loading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, merchantName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  session: null,
  user: null,
  merchant: null,
  loading: true,
  error: null,

  initialize: async () => {
    // If Supabase is not configured, skip auth entirely
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      set({ loading: false });
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const merchant = await fetchMerchant(session.user.id);
        set({ session, user: session.user, merchant, loading: false });
      } else {
        set({ loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const merchant = await fetchMerchant(session.user.id);
          set({ session, user: session.user, merchant });
        } else {
          set({ session: null, user: null, merchant: null });
        }
      });
    } catch {
      set({ loading: false });
    }
  },

  signUp: async (email, password, merchantName) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Sign-up failed — check your email for confirmation.');

      // Create merchant workspace
      const slug = merchantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        // @ts-expect-error — Supabase type inference mismatch with generated Database types
        .insert({ owner_id: data.user.id, name: merchantName, slug })
        .select()
        .single();

      if (merchantError) throw merchantError;

      // Seed demo data
      // @ts-expect-error — Supabase RPC type inference
      await supabase.rpc('seed_demo_data', { p_merchant_id: merchant.id });

      set({ user: data.user, merchant, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const merchant = await fetchMerchant(data.user.id);
      set({ session: data.session, user: data.user, merchant, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, merchant: null });
  },

  clearError: () => set({ error: null }),
}));

async function fetchMerchant(userId: string): Promise<Merchant | null> {
  const { data } = await supabase
    .from('merchants')
    .select('id, name, slug')
    .eq('owner_id', userId)
    .single();
  return data as Merchant | null;
}
