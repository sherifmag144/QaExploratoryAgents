// Module CHK — Checkout
const { test, expect } = require('@playwright/test');
const { shot, emptyCart } = require('../../helpers/target');

const BUYER = { firstName: 'QA-AUTO-Sherif', lastName: 'Magdy', postalCode: '11511' };

test.describe('CHK — Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await emptyCart(page);
  });

  test('TC-CHK-001 — [Smoke] An order can be placed from cart to confirmation', async ({ page }) => {
    test.info().annotations.push({ type: 'caseId', description: 'TC-CHK-001' });

    // Precondition: at least one product in the cart, on the Your Cart page.
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page.locator('.cart_item')).toHaveCount(1);

    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);

    await page.locator('[data-test="firstName"]').fill(BUYER.firstName);
    await page.locator('[data-test="lastName"]').fill(BUYER.lastName);
    await page.locator('[data-test="postalCode"]').fill(BUYER.postalCode);
    await page.locator('[data-test="continue"]').click();

    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await page.locator('[data-test="finish"]').click();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');

    await page.screenshot({ path: shot('TC-CHK-001') });
  });
});
