import { test, expect } from '@playwright/test';

test.describe('Forms & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/e2e/examples/forms.html');
  });

  test('1 — Required email: shows error for invalid, clears for valid', async ({ page }) => {
    const input = page.getByTestId('email-input');
    const error = page.getByTestId('email-error');

    await input.fill('invalid');
    await input.blur();
    await expect(error).not.toBeEmpty();

    await input.fill('test@test.com');
    await input.blur();
    await expect(error).toBeEmpty();
  });

  test('2 — Min/Max: shows error for out-of-range, clears for valid', async ({ page }) => {
    const input = page.getByTestId('age-input');
    const error = page.getByTestId('age-error');

    await input.fill('10');
    await input.blur();
    await expect(error).not.toBeEmpty();

    await input.fill('25');
    await input.blur();
    await expect(error).toBeEmpty();
  });

  test('3 — Match: shows error for mismatch, clears when matching', async ({ page }) => {
    const password = page.getByTestId('password-input');
    const confirm = page.getByTestId('confirm-input');
    const error = page.getByTestId('confirm-error');

    await password.fill('secret123');
    await confirm.fill('different');
    await confirm.blur();
    await expect(error).not.toBeEmpty();

    await confirm.fill('secret123');
    await confirm.blur();
    await expect(error).toBeEmpty();
  });

  test('4 — Submit button: disabled when invalid, enabled when valid', async ({ page }) => {
    const btn = page.getByTestId('submit-btn');

    // Initially disabled (required email is empty)
    await expect(btn).toBeDisabled();

    // Fill all fields with valid data
    await page.getByTestId('email-input').fill('test@test.com');
    await page.getByTestId('email-input').blur();
    await page.getByTestId('age-input').fill('25');
    await page.getByTestId('age-input').blur();
    await page.getByTestId('password-input').fill('mypassword');
    await page.getByTestId('confirm-input').fill('mypassword');
    await page.getByTestId('confirm-input').blur();

    await expect(btn).toBeEnabled();
  });

  test('5 — Dirty: initially false, becomes true after input', async ({ page }) => {
    const dirty = page.getByTestId('dirty-display');

    await expect(dirty).toHaveText('false');

    await page.getByTestId('email-input').fill('something');
    await expect(dirty).toHaveText('true');
  });

  test('6 — Reset: clears fields and resets dirty to false', async ({ page }) => {
    const emailInput = page.getByTestId('email-input');
    const ageInput = page.getByTestId('age-input');
    const dirty = page.getByTestId('dirty-display');

    // Fill some fields
    await emailInput.fill('test@test.com');
    await ageInput.fill('30');
    await expect(dirty).toHaveText('true');

    // Click reset
    await page.getByTestId('reset-btn').click();

    await expect(emailInput).toHaveValue('');
    await expect(ageInput).toHaveValue('');
    await expect(dirty).toHaveText('false');
  });

  test('7 — Custom validator: shows error for weak password, clears for strong', async ({ page }) => {
    const input = page.getByTestId('custom-input');
    const error = page.getByTestId('custom-error');

    await input.fill('abc');
    await input.blur();
    await expect(error).not.toBeEmpty();

    await input.fill('Abcdefg1');
    await input.blur();
    await expect(error).toBeEmpty();
  });
});
