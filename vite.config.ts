import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isDev = mode === 'development';

  return {
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    plugins: [
      tailwindcss(),
      react(),
    ],
    // API keys are NEVER shipped in production bundles.
    // In dev mode only, DEEPSEEK_API_KEY is available as a local-dev fallback
    // so the app works without a deployed Supabase Edge Function.
    define: isDev
      ? {
          'import.meta.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY || ''),
        }
      : {
          'import.meta.env.DEEPSEEK_API_KEY': JSON.stringify(''),
        },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
