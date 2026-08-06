import { defineConfig } from 'vitest/config'
import path from 'path'
import 'dotenv/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['node_modules', '.next', '**/node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './tests/mocks/server-only.ts'),
    },
  },
})
