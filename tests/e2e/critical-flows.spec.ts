import { test, expect, Page } from '@playwright/test';

// Test configuration
const config = {
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 30 * 1000, // 30 seconds
  viewport: { width: 1280, height: 720 },
};

test.describe('Critical User Flows', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    // Create a new context with saved authentication state
    const context = await browser.newContext({
      viewport: config.viewport,
      storageState: 'playwright/.auth/user.json',
    });
    page = await context.newPage();
    
    // Navigate to the home page
    await page.goto(config.baseURL);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should allow user to browse plans and complete checkout', async () => {
    test.setTimeout(60000); // 1 minute timeout for this test
    
    // Navigate to plans page
    await test.step('Navigate to plans page', async () => {
      await page.getByRole('link', { name: /plans/i }).click();
      await expect(page).toHaveURL(/\/plans/);
      await expect(page.getByRole('heading', { name: /available plans/i })).toBeVisible();
    });

    // Select a plan
    await test.step('Select a plan', async () => {
      const firstPlan = page.locator('.plan-card').first();
      await firstPlan.waitFor({ state: 'visible' });
      await firstPlan.getByRole('button', { name: /select plan/i }).click();
      
      // Verify plan was added to cart
      await expect(page.getByText(/1 item in cart/i)).toBeVisible();
    });
    
    // Proceed to checkout
    await test.step('Proceed to checkout', async () => {
      await page.getByRole('button', { name: /proceed to checkout/i }).click();
      await expect(page).toHaveURL(/\/checkout/);
      await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();
    });
    
    // Note: Payment form testing would be done with test cards in a real scenario
  });

  test('should handle user authentication flow', async () => {
    // Click sign in
    await test.step('Open authentication modal', async () => {
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/sign in to your account/i)).toBeVisible();
    });
    
    // Note: Actual authentication would be mocked in tests
  });

  test('should display order history for authenticated users', async () => {
    // This test requires authentication
    test.setTimeout(30000); // 30 seconds timeout for this test
    
    // Mock authentication state
    await test.step('Set up authenticated state', async () => {
      await page.evaluate(() => {
        window.localStorage.setItem('__clerk_db_jwt', 'test-jwt-token');
        window.localStorage.setItem('__clerk_session', JSON.stringify({
          user: { id: 'test-user-123', fullName: 'Test User' },
          status: 'active'
        }));
      });
    });
    
    // Navigate to orders
    await test.step('Navigate to order history', async () => {
      await page.getByRole('link', { name: /my orders/i }).click();
      await expect(page).toHaveURL(/\/orders/);
      await expect(page.getByRole('heading', { name: /order history/i })).toBeVisible();
    });
  });

  test('should handle 404 page not found', async () => {
    await test.step('Navigate to non-existent page', async () => {
      await page.goto(`${config.baseURL}/non-existent-page`);
      await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /go back home/i })).toBeVisible();
    });
  });
});
