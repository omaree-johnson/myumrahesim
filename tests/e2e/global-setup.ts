import { FullConfig, chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test
const envPath = path.resolve(__dirname, '../../../.env.test');
dotenv.config({ path: envPath });

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch({ headless: true });
  
  // Create a new browser context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  // Create a new page
  const page = await context.newPage();
  
  try {
    // Navigate to the base URL
    await page.goto(baseURL!);
    
    // Perform authentication if needed
    // This is a placeholder - replace with actual authentication logic
    if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
      // Example authentication flow
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
      await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD);
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Wait for navigation to complete
      await page.waitForURL('**/dashboard');
    }
    
    // Save signed-in state to 'storageState.json'
    await page.context().storageState({ path: storageState as string });
    
    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
