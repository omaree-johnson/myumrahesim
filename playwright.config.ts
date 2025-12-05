import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test
const envPath = path.resolve(__dirname, '.env.test');
dotenv.config({ path: envPath });

// Base URL for the application
const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test timeout (30 seconds)
const timeout = 30 * 1000;

// Configure the test environment
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Timeout for each test
  timeout,
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry tests on CI if they fail
  retries: process.env.CI ? 2 : 0,
  
  // Number of workers for parallel testing
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['list'],
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot after each test failure
    screenshot: 'only-on-failure',
    
    // Record video for failed tests
    video: 'on-first-retry',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configure browser context options
        contextOptions: {
          // Enable JavaScript
          javaScriptEnabled: true,
          // Set timezone
          timezoneId: 'UTC',
          // Set locale
          locale: 'en-US',
          // Set geolocation
          geolocation: { longitude: 12.492507, latitude: 41.889938 },
          // Set permissions
          permissions: ['geolocation', 'notifications'],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
