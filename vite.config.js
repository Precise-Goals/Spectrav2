/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      nodePolyfills({
        // Ponytail: Only include exactly what Ethers v6 and Stellar SDK need.
        include: ['buffer', 'process', 'stream', 'util'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    assetsInclude: ['**/*.splinecode'],
    define: {
      'import.meta.env.VITE_ADMIN_URL': JSON.stringify(env.ADMIN_URL),
      'import.meta.env.VITE_ADMIN_PASS': JSON.stringify(env.ADMIN_PASS),
      'import.meta.env.VITE_STELLAR_TREASURY_SECRET': JSON.stringify(env.STELLAR_TREASURY_SECRET),
      global: 'globalThis'
    },
    server: {
      proxy: {
        '/sarvam-api': {
          target: 'https://api.sarvam.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/sarvam-api/, ''),
        },
        '/soroban-rpc': {
          target: 'https://stellar-soroban-testnet-public.nodies.app',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/soroban-rpc/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('origin');
            });
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 3500,
    },
  }
})