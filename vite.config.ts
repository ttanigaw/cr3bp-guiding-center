import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.app.github.dev'],
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts?(x)'],
  },
})
