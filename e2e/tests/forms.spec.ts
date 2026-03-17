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

  // ── Revamp tests ──────────────────────────────────────

  test('8 — Auto-detect HTML5 required (no validate="")', async ({ page }) => {
    const input = page.getByTestId('html5-required-input');
    const error = page.getByTestId('html5-required-error');
    const valid = page.getByTestId('html5-required-valid');

    // Form is invalid but errors only show after interaction
    await expect(valid).toHaveText('false');
    await expect(error).toBeEmpty();

    // Touch the field to trigger error display
    await input.focus();
    await input.blur();
    await expect(error).not.toBeEmpty();

    await input.fill('myuser');
    await input.blur();
    await expect(valid).toHaveText('true');
    await expect(error).toBeEmpty();
  });

  test('9 — Per-rule error messages', async ({ page }) => {
    const input = page.getByTestId('per-rule-input');
    const error = page.getByTestId('per-rule-error');

    // Empty → required message
    await input.fill('');
    await input.blur();
    await expect(error).toHaveText('Email is mandatory');

    // Invalid email → email message
    await input.fill('bad');
    await expect(error).toHaveText('Invalid email format');

    // Valid
    await input.fill('test@test.com');
    await expect(error).toBeEmpty();
  });

  test('10 — Auto-disable submit (no bind-disabled)', async ({ page }) => {
    const btn = page.getByTestId('auto-disable-btn');
    const cancel = page.getByTestId('auto-disable-cancel');
    const input = page.getByTestId('auto-disable-input');

    // Submit starts disabled
    await expect(btn).toBeDisabled();
    // Cancel button is not affected
    await expect(cancel).toBeEnabled();

    await input.fill('John');
    await expect(btn).toBeEnabled();

    await input.fill('');
    await expect(btn).toBeDisabled();
  });

  test('11 — error-class applied on invalid + touched', async ({ page }) => {
    const input = page.getByTestId('error-class-input');

    // Not touched yet — no error class
    await expect(input).not.toHaveClass(/border-red/);

    // Touch + empty → error class
    await input.focus();
    await input.blur();
    await expect(input).toHaveClass(/border-red/);

    // Fill → error class removed
    await input.fill('data');
    await expect(input).not.toHaveClass(/border-red/);
  });

  test('12 — validate-on="blur" defers validation', async ({ page }) => {
    const input = page.getByTestId('validate-on-input');
    const error = page.getByTestId('validate-on-error');

    await input.fill('hello');
    // Error should not appear yet (blur trigger)
    await expect(error).toBeEmpty();

    await input.clear();
    await input.blur();
    // Now validation runs
    await expect(error).not.toBeEmpty();
  });

  test('13 — firstError and errorCount', async ({ page }) => {
    const firstError = page.getByTestId('first-error');
    const errorCount = page.getByTestId('error-count');
    const countA = page.getByTestId('count-a');
    const countB = page.getByTestId('count-b');

    // Before interaction, errors are not displayed
    await expect(errorCount).toHaveText('0');

    // Touch both fields to trigger error display
    await countA.focus();
    await countA.blur();
    await countB.focus();
    await countB.blur();
    await expect(firstError).toHaveText('Field A is required');
    await expect(errorCount).toHaveText('2');

    await countA.fill('ok');
    await expect(firstError).toHaveText('Field B is required');
    await expect(errorCount).toHaveText('1');

    await countB.fill('ok');
    await expect(errorCount).toHaveText('0');
  });

  test('14 — validate-if conditional validation', async ({ page }) => {
    const valid = page.getByTestId('vif-valid');
    const toggle = page.getByTestId('vif-toggle');
    const input = page.getByTestId('vif-input');
    const error = page.getByTestId('vif-error');

    // Unchecked → company not validated → form valid
    await expect(valid).toHaveText('true');
    await expect(error).toBeEmpty();

    // Check → now company is required, touch the field to show error
    await toggle.check();
    await input.focus();
    await input.blur();
    await expect(valid).toHaveText('false');
    await expect(error).toHaveText('Company is required');

    // Fill company
    await input.fill('ACME');
    await expect(valid).toHaveText('true');
    await expect(error).toBeEmpty();
  });

  test('15 — $form.fields per-field state', async ({ page }) => {
    const input = page.getByTestId('fields-input');
    const valid = page.getByTestId('fields-valid');
    const dirty = page.getByTestId('fields-dirty');
    const touched = page.getByTestId('fields-touched');

    await expect(valid).toHaveText('false');
    await expect(dirty).toHaveText('false');
    await expect(touched).toHaveText('false');

    await input.fill('test');
    await expect(valid).toHaveText('true');
    await expect(dirty).toHaveText('true');

    await input.blur();
    await expect(touched).toHaveText('true');
  });

  test('16 — Error template reference', async ({ page }) => {
    const rendered = page.getByTestId('tpl-rendered');
    const input = page.getByTestId('tpl-input');

    // Before interaction, template should not render
    await expect(rendered).toHaveCount(0);

    // Touch the field to trigger error template
    await input.focus();
    await input.blur();
    await expect(rendered).toHaveCount(1);
    await expect(rendered).not.toBeEmpty();

    // Fill → template should be removed
    await input.fill('ok');
    await expect(rendered).toHaveCount(0);

    // Clear → template should appear again
    await input.clear();
    await expect(rendered).toHaveCount(1);
  });

  test('17 — Radio group value', async ({ page }) => {
    const value = page.getByTestId('radio-value');
    const red = page.getByTestId('radio-red');
    const blue = page.getByTestId('radio-blue');

    await red.check();
    await expect(value).toHaveText('red');

    await blue.check();
    await expect(value).toHaveText('blue');
  });

  test('18 — Checkbox required', async ({ page }) => {
    const valid = page.getByTestId('checkbox-valid');
    const cb = page.getByTestId('checkbox-input');

    await expect(valid).toHaveText('false');

    await cb.check();
    await expect(valid).toHaveText('true');

    await cb.uncheck();
    await expect(valid).toHaveText('false');
  });
});
