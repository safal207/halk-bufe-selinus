import {defineConfig} from '@playwright/test';

const browser = process.env.E2E_BROWSER || 'chromium';
const useBrowser = browser === 'msedge' ? {browserName:'chromium',channel:'msedge'} : {browserName:browser};

export default defineConfig({
  testDir: './tests',
  testMatch: 'browser.spec.mjs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: {timeout: 9000},
  reporter: [
    ['line'],
    ['html',{open:'never',outputFolder:'playwright-report'}]
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: {width:390,height:844},
    reducedMotion: 'no-preference',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...useBrowser
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
