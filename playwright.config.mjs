import { defineConfig } from '@playwright/test'

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, '')

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  reporter: 'line',
  use: {
    baseURL: externalBaseUrl || 'http://127.0.0.1:4381',
    browserName: 'chromium',
    headless: true,
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'python -m http.server 4381 -d .output/public',
        url: 'http://127.0.0.1:4381/',
        reuseExistingServer: false,
        timeout: 30_000,
      },
})
