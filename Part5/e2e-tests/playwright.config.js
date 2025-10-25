// @ts-check
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    headless: true,
    launchOptions: {
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },

    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev:test',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 60000,
  },
})
