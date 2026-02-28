import { test, expect } from '@playwright/test';

test.describe('Fetch', () => {
  // Default route handlers so every section on the page gets a response
  test.beforeEach(async ({ page }) => {
    // GET /api/users (list)
    await page.route('**/api/users', (route) => {
      if (route.request().method() === 'GET' && route.request().url().endsWith('/api/users')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { name: 'Alice' },
            { name: 'Bob' },
            { name: 'Charlie' }
          ])
        });
      } else if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1 })
        });
      } else {
        route.fallback();
      }
    });

    // GET /api/slow
    await page.route('**/api/slow', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Done!' })
      });
    });

    // GET /api/error
    await page.route('**/api/error', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    });

    // GET /api/empty
    await page.route('**/api/empty', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // GET /api/users/1
    await page.route('**/api/users/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'User One' })
      });
    });

    // GET /api/users/2
    await page.route('**/api/users/2', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'User Two' })
      });
    });
  });

  test('1 — GET renders user list', async ({ page }) => {
    await page.goto('/e2e/examples/fetch.html');
    const items = page.getByTestId('user-item');
    await expect(items).toHaveCount(3);
    await expect(items.first()).toHaveText('Alice');
  });

  test('2 — Loading state shows while request pending', async ({ page }) => {
    // Override slow route with actual delay
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    await page.route('**/api/users', (route) => {
      if (route.request().url().endsWith('/api/users')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ name: 'Alice' }])
        });
      } else {
        route.fallback();
      }
    });

    await page.route('**/api/slow', async (route) => {
      await new Promise(r => setTimeout(r, 500));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Done!' })
      });
    });

    await page.route('**/api/error', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    });

    await page.route('**/api/empty', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/api/users/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'User One' })
      });
    });

    await page.goto('/e2e/examples/fetch.html');
    await expect(page.getByTestId('loading-msg')).toBeVisible();
    await expect(page.getByTestId('loaded-data')).toHaveText('Done!', { timeout: 5000 });
  });

  test('3 — Error state shows on failure', async ({ page }) => {
    await page.goto('/e2e/examples/fetch.html');
    await expect(page.getByTestId('error-msg')).toBeVisible({ timeout: 5000 });
  });

  test('4 — Empty state shows on empty response', async ({ page }) => {
    await page.goto('/e2e/examples/fetch.html');
    await expect(page.getByTestId('empty-msg')).toBeVisible({ timeout: 5000 });
  });

  test('5 — Reactive URL re-fetches on change', async ({ page }) => {
    await page.goto('/e2e/examples/fetch.html');
    await expect(page.getByTestId('reactive-user')).toHaveText('User One', { timeout: 5000 });
    await page.getByTestId('user-id-input').fill('2');
    await expect(page.getByTestId('reactive-user')).toHaveText('User Two', { timeout: 5000 });
  });

  test('6 — Form POST submits data', async ({ page }) => {
    let postedBody: any;
    // Override POST handler to capture body
    await page.unrouteAll({ behavior: 'ignoreErrors' });

    await page.route('**/api/users', (route) => {
      if (route.request().method() === 'POST') {
        postedBody = route.request().postDataJSON();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1 })
        });
      } else if (route.request().url().endsWith('/api/users')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ name: 'Alice' }])
        });
      } else {
        route.fallback();
      }
    });

    await page.route('**/api/slow', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Done!' })
      });
    });

    await page.route('**/api/error', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    });

    await page.route('**/api/empty', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('**/api/users/1', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'User One' })
      });
    });

    await page.goto('/e2e/examples/fetch.html');
    await page.getByTestId('form-name').fill('Dave');
    await page.getByTestId('form-submit').click();
    await expect(page.getByTestId('post-result')).toBeVisible({ timeout: 5000 });
  });
});
