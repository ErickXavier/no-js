import { test, expect } from '@playwright/test';

test.describe('Routing — Wildcard 404 Catch-All', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/routing-404.html');
  });

  test('1 — Custom 404 page renders for unmatched route', async ({ page }) => {
    await page.getByTestId('nav-404').click();

    const notFound = page.getByTestId('page-404');
    await expect(notFound).toBeVisible();

    const path = page.getByTestId('404-path');
    await expect(path).toHaveText('/does-not-exist');
  });

  test('2 — Go Home link on 404 page navigates back to home', async ({ page }) => {
    // Navigate to 404
    await page.getByTestId('nav-404').click();
    await expect(page.getByTestId('page-404')).toBeVisible();

    // Click "Go Home"
    await page.getByTestId('404-home-link').click();

    const home = page.getByTestId('page-home');
    await expect(home).toBeVisible();
    await expect(page.getByTestId('page-404')).toBeHidden();
  });

  test('3 — Valid route renders correctly after visiting 404', async ({ page }) => {
    // Navigate to 404 first
    await page.getByTestId('nav-404').click();
    await expect(page.getByTestId('page-404')).toBeVisible();

    // Navigate to a valid route
    await page.getByTestId('nav-about').click();

    const about = page.getByTestId('page-about');
    await expect(about).toBeVisible();
    await expect(page.getByTestId('page-404')).toBeHidden();
  });
});

test.describe('Routing — Built-in 404 Fallback (no wildcard)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/routing-no-wildcard.html');
  });

  test('4 — Built-in 404 renders when no wildcard is defined', async ({ page }) => {
    await page.getByTestId('nav-nowhere').click();

    const outlet = page.getByTestId('outlet');
    await expect(outlet).toContainText('404');
  });
});
