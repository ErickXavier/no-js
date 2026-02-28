import { test, expect } from '@playwright/test';

test.describe('Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/animations.html');
  });

  test('1 — Animate fadeIn: element appears with fadeIn class', async ({ page }) => {
    const target = page.getByTestId('fade-target');
    await expect(target).toBeHidden();

    await page.getByTestId('fade-toggle').click();
    await expect(target).toBeVisible();
    await expect(target).toHaveClass(/fadeIn/);
    await expect(target).toHaveText('Faded in!');
  });

  test('2 — Enter/leave: slideIn on enter, fadeOut on leave', async ({ page }) => {
    const target = page.getByTestId('enterleave-target');
    await expect(target).toBeHidden();

    // Toggle on → enter animation
    await page.getByTestId('enterleave-toggle').click();
    await expect(target).toBeVisible();
    await expect(target).toHaveClass(/slideIn/);

    // Toggle off → leave animation, then element removed
    await page.getByTestId('enterleave-toggle').click();
    await expect(target).toBeHidden({ timeout: 5000 });
  });

  test('3 — Stagger: items have incremental animation delays', async ({ page }) => {
    const items = page.getByTestId('stagger-item');
    await expect(items).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      const delay = await items.nth(i).evaluate(
        el => getComputedStyle(el).animationDelay || el.style.animationDelay
      );
      const expectedMs = i * 100;
      const expectedSec = `${expectedMs / 1000}s`;
      // Delay should match the stagger offset (0s, 0.1s, 0.2s, 0.3s)
      expect(delay).toBe(expectedMs === 0 ? '0s' : expectedSec);
    }
  });

  test('4 — Transition: element appears with transition classes', async ({ page }) => {
    const target = page.getByTestId('transition-target');
    await expect(target).toBeHidden();

    await page.getByTestId('transition-toggle').click();
    await expect(target).toBeVisible();
    // Should have transition-related class during enter
    const classes = await target.getAttribute('class');
    expect(classes).toMatch(/fade-enter|fade-enter-active/);
  });
});
