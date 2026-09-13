// Permanent config. Do not regenerate this file per run.
// It finds the run's specs under specs/<run-id>/ and writes every artefact
// into outputs/<run-id>/ at the repo root.
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');
const { target, RUN_ID, SPEC_DIR, OUT_DIR } = require('./helpers/target');

console.log(`[qa-flow] run: ${RUN_ID}`);

module.exports = defineConfig({
  testDir: SPEC_DIR,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: [
    ['json', { outputFile: path.join(OUT_DIR, 'raw-playwright.json') }],
    ['list'],
  ],
  use: {
    baseURL: target.baseUrl,
    viewport: {
      width: target.browser.viewport.width,
      height: target.browser.viewport.height,
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
  },
  outputDir: path.join(OUT_DIR, 'test-results'),
  projects: [
    {
      name: 'setup',
      testDir: path.join(__dirname, 'fixtures'),
      testMatch: /auth\.setup\.js/,
      // Uses the Google Chrome already installed on this machine, so no extra
      // browser download is needed.
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    {
      name: 'run',
      dependencies: ['setup'],
      testMatch: /\.spec\.js$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: path.join(__dirname, '.auth', 'state.json'),
      },
    },
  ],
});
