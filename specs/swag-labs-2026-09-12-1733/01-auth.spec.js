// Module AUTH — Login and Session
const { test, expect } = require('@playwright/test');
const { primary, shot } = require('../../helpers/target');

// This case must perform a real login, so it starts with no saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('AUTH — Login and Session', () => {
  test('TC-AUTH-001 — [Smoke] Standard user can log in and land on the Products page', async ({ page }) => {
    test.info().annotations.push({ type: 'caseId', description: 'TC-AUTH-001' });

    await page.goto('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();

    await page.locator('[data-test="username"]').fill(primary.username);
    await page.locator('[data-test="password"]').fill(primary.password);
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');

    await page.screenshot({ path: shot('TC-AUTH-001') });
  });
});
