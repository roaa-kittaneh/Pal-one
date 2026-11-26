import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// One .env for the whole project lives at the repository root.
const envDir = path.resolve(import.meta.dirname, '..');

export default defineConfig(({ mode }) => {
  // Only used for the dev proxy target; only VITE_* variables reach the browser bundle.
  const env = loadEnv(mode, envDir, '');
  const apiPort = env.PORT || '4000';
  return {
    envDir,
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      // The browser calls /api on the Vite origin; Vite forwards it to Express,
      // so development needs no CORS setup or hard-coded hosts.
      proxy: { '/api': { target: `http://localhost:${apiPort}`, changeOrigin: true } },
    },
  };
});
