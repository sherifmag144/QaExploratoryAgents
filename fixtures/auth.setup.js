// Logs in once and saves the authenticated session so the specs do not
// log in over and over. The cart is emptied before the state is saved.
const { test: setup, expect } = require('@playwright/test');
const path = require('path');
const { primary } = require('../helpers/target');

const STATE = path.resolve(__dirname, '../.auth/state.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(primary.username);
  await page.locator('[data-test="password"]').fill(primary.password);
  await page.locator('[data-test="login-button"]').click();

  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');

  await page.evaluate(() => window.localStorage.setItem('cart-contents', '[]'));
  await page.context().storageState({ path: STATE });
});
