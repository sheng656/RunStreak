import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    // Vitest configuration — runs in a jsdom environment so DOM APIs are available
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the .NET backend during local development.
    // This avoids CORS issues in dev by forwarding /api/* to the backend port.
    proxy: {
      '/api': {
        target: 'http://localhost:5136',
        changeOrigin: true,
      },
    },
  },
})
