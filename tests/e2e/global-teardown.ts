import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  // Clean up any test data or resources
  const testResultsDir = path.join(process.cwd(), 'test-results');
  
  // Remove test results directory if it exists
  if (fs.existsSync(testResultsDir)) {
    fs.rmSync(testResultsDir, { recursive: true, force: true });
  }
  
  // Clean up any other resources if needed
  console.log('Global teardown completed');
}

export default globalTeardown;
