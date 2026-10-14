import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isLocal =
  process.env.RUN_LOCAL_SERVER === '1' ||
  process.env.npm_lifecycle_event === 'test:local' ||
  Boolean(process.env.BASE_URL && process.env.BASE_URL.includes('8787'));

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 2, // Strict production safety: max 2 workers
  retries: 1,
  reporter: [
    ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'results.json' }],
    ['html', { open: 'never', outputFolder: 'html-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://quranific.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    extraHTTPHeaders: {
      'X-E2E-Agent': 'QuranificE2E/1.0',
    },
  },
  webServer: isLocal
    ? {
        command: 'npx wrangler dev --config dist/server/wrangler.json --port 8787 --ip 127.0.0.1',
        port: 8787,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        cwd: path.resolve(__dirname, '../../'),
        env: {
          RESEND_API_KEY: 're_test_mock_key_00000000',
          JWT_SECRET: 'e2e-round3-secret-0123456789abcdef0123456789abcdef',
          INTERNAL_WORKER_SECRET: 'e2e-internal',
          TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
          RESEND_AUDIENCE_ID: 'test-audience-id-12345',
        },
      }
    : undefined,
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        userAgent: (devices['Desktop Chrome'].userAgent || '') + ' QuranificE2E/1.0',
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 7'],
        userAgent: (devices['Pixel 7'].userAgent || '') + ' QuranificE2E/1.0',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14'],
        userAgent: (devices['iPhone 14'].userAgent || '') + ' QuranificE2E/1.0',
      },
    },
    {
      name: 'desktop-firefox',
      use: {
        ...devices['Desktop Firefox'],
        userAgent: (devices['Desktop Firefox'].userAgent || '') + ' QuranificE2E/1.0',
      },
    },
  ],
});
