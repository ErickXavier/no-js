import { test, expect } from '@playwright/test';

test.describe('Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/templates.html');
  });

  test('1 — Remote template: header partial loads', async ({ page }) => {
    const header = page.getByTestId('remote-header');
    await expect(header).toBeVisible({ timeout: 5000 });
    await expect(header).toContainText('Remote Header Loaded');
  });

  test('2 — Inline include: badge renders', async ({ page }) => {
    const badge = page.getByTestId('badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Badge');
  });

  test('3 — use + var: card renders with passed title and body', async ({ page }) => {
    const title = page.getByTestId('card-title').first();
    await expect(title).toHaveText('My Card Title');

    const body = page.getByTestId('card-body');
    await expect(body).toHaveText('Custom body content');
  });

  test('4 — Slots: projected body and footer render', async ({ page }) => {
    const body = page.getByTestId('slot-body');
    await expect(body).toBeVisible();
    await expect(body).toHaveText('Projected body');

    const footer = page.getByTestId('slot-footer');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveText('Custom footer');
  });

  test('5 — Default slot: default footer shows when no projection', async ({ page }) => {
    // The third card instance (Test 5) should show the default footer
    const defaultFooters = page.getByTestId('card-default-footer');
    await expect(defaultFooters.last()).toBeVisible();
    await expect(defaultFooters.last()).toHaveText('Default footer');
  });
});
