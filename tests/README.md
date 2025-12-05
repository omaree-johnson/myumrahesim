# End-to-End Testing

This directory contains end-to-end (E2E) tests for the eSIM PWA application. The tests are written using Playwright and TypeScript.

## Test Structure

- `e2e/` - Contains all E2E test files
  - `global-setup.ts` - Runs before all tests to set up the test environment
  - `global-teardown.ts` - Runs after all tests to clean up resources
  - `utils/` - Contains utility functions for tests
  - `critical-flows.spec.ts` - Tests for critical user flows

## Running Tests

### Prerequisites

- Node.js 16+
- pnpm
- All project dependencies installed (`pnpm install`)

### Available Scripts

- `pnpm test:e2e` - Run all E2E tests in headless mode
- `pnpm test:e2e:ui` - Run tests with Playwright UI
- `pnpm test:e2e:debug` - Run tests in debug mode
- `pnpm test:e2e:report` - Show HTML test report
- `pnpm test:all` - Run both unit and E2E tests

### Environment Variables

Create a `.env.test` file in the project root with the following variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add other environment variables as needed
```

## Writing Tests

### Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Page Object Model**: Consider creating page objects for complex pages to improve test maintainability.
3. **Selectors**: Use data-testid or other stable selectors instead of relying on CSS classes or structure.
4. **Waiting**: Use `page.waitFor*` methods to wait for elements to be ready before interacting with them.
5. **Assertions**: Make assertions specific and meaningful.

### Example Test

```typescript
import { test, expect } from '@playwright/test';
import { mockAuthenticatedState } from './utils/test-utils';

test.describe('User Profile', () => {
  test('should display user profile information', async ({ page }) => {
    // Mock authenticated state
    await mockAuthenticatedState(page, {
      fullName: 'Test User',
      email: 'test@example.com'
    });

    // Navigate to profile page
    await page.goto('/profile');
    
    // Assert profile information is displayed
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });
});
```

## Debugging Tests

1. Use `test.only` to run a single test
2. Use `test.slow()` to mark slow tests
3. Use `test.fail()` to mark tests that are expected to fail
4. Use `test.skip()` to skip tests temporarily
5. Use `page.pause()` to pause test execution and use Playwright Inspector

## Continuous Integration

Tests are automatically run in CI on every push and pull request. The CI configuration can be found in `.github/workflows/`.

## Test Reports

After running tests, an HTML report is generated in the `test-results/` directory. Open `test-results/html/index.html` to view the report.
