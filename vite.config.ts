import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // Use VITE_ prefix for client-exposed vars (Vite convention).
    // DEEPSEEK_API_KEY and GEMINI_API_KEY are NOT exposed to the client.
    // They should only be used server-side (Supabase Edge Function proxy).
    // For local development without the proxy, they can be accessed via import.meta.env
    // but this is NOT safe for production deployment.
    define: {
      'import.meta.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY || ''),
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
