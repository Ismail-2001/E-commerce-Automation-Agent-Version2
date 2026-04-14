import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create the real client when credentials are available.
// Otherwise provide a dummy that won't crash the app at import time.
export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> = supabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : (new Proxy({} as unknown as SupabaseClient<Database>, {
      get(_target, prop) {
        // Return no-op stubs so code that references supabase.auth / supabase.from etc. doesn't crash
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            signUp: async () => ({
              data: { user: null },
              error: { message: 'Supabase not configured' },
            }),
            signInWithPassword: async () => ({
              data: {},
              error: { message: 'Supabase not configured' },
            }),
            signOut: async () => {},
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          };
        }
        if (prop === 'from') {
          return () => ({
            select: () => ({
              eq: () => ({
                single: async () => ({ data: null, error: null }),
                order: () => ({ data: [], error: null }),
              }),
              order: () => ({ data: [], error: null }),
              data: [],
              error: null,
            }),
            insert: async () => ({ data: null, error: null }),
            update: () => ({ eq: async () => ({ data: null, error: null }) }),
            delete: () => ({ eq: async () => ({ data: null, error: null }) }),
          });
        }
        if (prop === 'functions') {
          return {
            invoke: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          };
        }
        if (prop === 'channel') {
          return () => ({
            on: function () {
              return this;
            },
            subscribe: () => {},
          });
        }
        if (prop === 'removeChannel') {
          return () => {};
        }
        if (prop === 'rpc') {
          return async () => ({ data: null, error: null });
        }
        return () => {};
      },
    }) as unknown as SupabaseClient<Database>);
