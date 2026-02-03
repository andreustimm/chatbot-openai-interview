import { defineConfig, devices } from '@playwright/test';

// Detect if running inside Docker (via PLAYWRIGHT_BASE_URL env var)
const isDocker = !!process.env.PLAYWRIGHT_BASE_URL;

const backendPort = process.env.CI ? 4000 : 4000;
const frontendPort = 5173;

// Use Docker internal URLs when running in container, localhost otherwise
const baseURL = isDocker
  ? process.env.PLAYWRIGHT_BASE_URL
  : `http://localhost:${frontendPort}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Only start webServer when NOT running in Docker (services are already up in Docker)
  ...(isDocker
    ? {}
    : {
        webServer: [
          {
            command: `npm run start:dev`,
            cwd: '../backend',
            url: `http://localhost:${backendPort}`,
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
            env: {
              PORT: String(backendPort),
              OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'test-key',
              OPENAI_MODEL: 'gpt-3.5-turbo',
            },
          },
          {
            command: `npm run dev`,
            cwd: '../frontend',
            url: `http://localhost:${frontendPort}`,
            reuseExistingServer: !process.env.CI,
            timeout: 120000,
            env: {
              VITE_API_URL: `http://localhost:${backendPort}`,
            },
          },
        ],
      }),
});
