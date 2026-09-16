import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGitHubPagesBuild ? '/cr3bp-guiding-center/' : '/',
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
