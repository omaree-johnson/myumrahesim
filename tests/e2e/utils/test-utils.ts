import { Page } from '@playwright/test';

/**
 * Waits for the page to be fully loaded
 * @param page - The Playwright page object
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('load');
}

/**
 * Takes a screenshot of the current page
 * @param page - The Playwright page object
 * @param name - Name for the screenshot file
 */
export async function takeScreenshot(page: Page, name: string) {
  const screenshotPath = `test-results/screenshots/${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

/**
 * Mocks authentication state for testing
 * @param page - The Playwright page object
 * @param userData - Optional user data to mock
 */
export async function mockAuthenticatedState(page: Page, userData: any = {}) {
  await page.evaluate((data) => {
    const defaultUser = {
      id: 'test-user-123',
      fullName: 'Test User',
      email: 'test@example.com',
      ...data
    };
    
    window.localStorage.setItem('__clerk_db_jwt', 'test-jwt-token');
    window.localStorage.setItem('__clerk_session', JSON.stringify({
      user: defaultUser,
      status: 'active',
      lastActiveAt: Date.now()
    }));
  }, userData);
}

/**
 * Clears all browser data (cookies, localStorage, sessionStorage)
 * @param page - The Playwright page object
 */
export async function clearBrowserData(page: Page) {
  const context = page.context();
  const pages = context.pages();
  
  for (const page of pages) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    const cookies = await context.cookies();
    if (cookies.length) {
      await context.clearCookies();
    }
  }
}

/**
 * Waits for a specific network request to complete
 * @param page - The Playwright page object
 * @param url - The URL or regex to match against network requests
 * @param method - The HTTP method to match (optional)
 */
export async function waitForNetworkRequest(
  page: Page, 
  url: string | RegExp, 
  method: string = 'GET'
) {
  return page.waitForRequest(
    request => {
      const urlMatches = typeof url === 'string' 
        ? request.url().includes(url)
        : url.test(request.url());
      
      return urlMatches && request.method() === method.toUpperCase();
    },
    { timeout: 30000 }
  );
}

/**
 * Waits for a specific response
 * @param page - The Playwright page object
 * @param url - The URL or regex to match against responses
 * @param status - The expected status code (default: 200)
 */
export async function waitForResponse(
  page: Page,
  url: string | RegExp,
  status: number = 200
) {
  return page.waitForResponse(
    response => {
      const urlMatches = typeof url === 'string'
        ? response.url().includes(url)
        : url.test(response.url());
      
      return urlMatches && response.status() === status;
    },
    { timeout: 30000 }
  );
}

/**
 * Scrolls to the bottom of the page
 * @param page - The Playwright page object
 */
export async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
