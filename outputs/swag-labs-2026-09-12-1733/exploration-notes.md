# Exploration Notes — Swag Labs (SauceDemo)

URL: https://www.saucedemo.com
Role used: standard_user (also tried locked_out_user)
Language(s): English only. No RTL, no language switch.
Date: 2026-09-12, 17:33 Cairo
Run ID: swag-labs-2026-09-12-1733

This is a public demo shop used for automation practice. It is a small e-commerce
flow: log in, browse six products, add to a cart, fill a short form, place the
order. There is no admin area, no roles, no search, no pagination, no file
upload, no dates, and no budget screens.

---

## Module: Login and Session (AUTH)   (/)

What it does: single login form. The page itself lists six demo accounts and one
shared password, so credentials are public.

Screens found: login page, error state.
Fields: Username (text, required), Password (password, required).
Actions: Login. Dismiss error (small x inside the error box).
Accounts seen on the page: standard_user, locked_out_user, problem_user,
performance_glitch_user, error_user, visual_user.

Rules observed (exact on-screen text):
- Empty form → "Epic sadface: Username is required"
- Username only → "Epic sadface: Password is required"
- Wrong password → "Epic sadface: Username and password do not match any user in this service"
- locked_out_user → "Epic sadface: Sorry, this user has been locked out."
- Opening /inventory.html while logged out → redirected to the login page with
  "Epic sadface: You can only access '/inventory.html' when you are logged in."
- After Logout, the browser Back button does not restore the previous page; the
  same "you can only access ... when you are logged in" message appears.
- Logging out and logging back in empties the cart.

## Module: Products (PROD)   (/inventory.html)

What it does: shows all six products. This is the landing page after login.

Screens found: product list, product details page (/inventory-item.html?id=N),
side menu.
Products and prices: Sauce Labs Backpack $29.99, Sauce Labs Bike Light $9.99,
Sauce Labs Bolt T-Shirt $15.99, Sauce Labs Fleece Jacket $49.99,
Sauce Labs Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99.
Actions: Sort products (Name A-Z, Name Z-A, Price low-high, Price high-low),
Add to cart / Remove per card, open a product, open the side menu.
Side menu items: All Items, Dynamic Catalog, About (external link to
saucelabs.com), Logout, Reset App State.

Rules observed:
- Sorting by Price (low to high) gives 7.99, 9.99, 15.99, 15.99, 29.99, 49.99 —
  correct.
- The Add to cart button turns into Remove, and the same state is shown on the
  product details page.
- There is no search box, no filter and no pagination. Six products always.

## Module: Cart (CART)   (/cart.html)

What it does: lists what was added. QTY is fixed at 1 for every row — there is no
way to change the quantity, and adding the same product twice is not possible
because the button becomes Remove.

Actions: Remove per row, Continue Shopping, Checkout.

Rules observed:
- The cart survives a page refresh (the count stayed at 2).
- Removing the last row leaves the page with only the "QTY" and "Description"
  headers and no message.
- The cart is emptied after an order is completed.

## Module: Checkout (CHK)   (/checkout-step-one.html → step-two → complete)

What it does: three steps. Information form, then an overview with the price
breakdown, then a confirmation page.

Fields: First Name, Last Name, Zip/Postal Code — all three text inputs, all
required, none has a maxlength attribute and none has a visible label (the field
name is placeholder text only).
Actions: Continue, Cancel, Finish, Back Home.

Rules observed (exact on-screen text):
- Empty form → "Error: First Name is required"
- First name only → "Error: Last Name is required"
- First and last name only → "Error: Postal Code is required"
- Payment and shipping are fixed text: "SauceCard #31337", "Free Pony Express
  Delivery!". Nothing to enter.
- Tax is 8% of the item total. Checked with $39.98: "Tax: $3.20",
  "Total: $43.18" — correct.
- Confirmation page: "Thank you for your order!" and "Your order has been
  dispatched, and will arrive just as fast as the pony can get there!"

---

## Suspected defects

**1. An order can be placed with an empty cart.**
Emptied the cart, clicked Checkout, filled the form with valid values, clicked
Continue, and reached the overview page. It showed no product rows,
"Item total: $0", "Tax: $0.00", "Total: $0.00", and the Finish button was
enabled. Clicking Finish produced the normal "Thank you for your order!"
confirmation. An empty order was accepted.
Covered by TC-CHK-005.

**2. A Zip/Postal Code of only spaces passes validation.**
Filled First Name and Last Name, typed three spaces in Zip/Postal Code, clicked
Continue. The form was accepted and the overview page opened. The same field
shows "Error: Postal Code is required" when left completely empty, so the
validation only checks the length, not the content.
Covered by TC-CHK-007.

**3. The sort selection is lost after a page refresh.**
Set the sort to "Price (low to high)", refreshed the page. The dropdown went back
to "Name (A to Z)" and the list was re-ordered, while the cart contents survived
the same refresh. State is kept for the cart but not for the sort.
Covered by TC-PROD-003.

**4. The cart icon is announced as "Cart, 1 items".**
With one product in the cart, the accessible name of the cart icon is
"Cart, 1 items" — plural with the number 1. Cosmetic, but it is read out to
screen reader users.
Covered by TC-PROD-005.

**5. "Dynamic Catalog" in the side menu has no visible effect.**
Clicking it keeps the user on /inventory.html with the same six products in the
same order, the header still reads "Products", and the side menu does not close.
"All Items" in the same menu behaves identically. Either the menu item does
nothing, or it does something that is not visible on screen.
Covered by TC-PROD-006.

**6. An empty cart shows no empty state.**
After removing the last product, the cart area shows only the "QTY" and
"Description" headers with nothing under them. There is no "your cart is empty"
message, and the Checkout button stays enabled.
Covered by TC-CART-006 and TC-CHK-005.

---

## Open questions

- Is "Dynamic Catalog" meant to show a different set of products from
  "All Items"? Right now the two are identical.
- Should the checkout stop the user when the cart is empty, or is placing a $0
  order intended demo behaviour?
- The empty-cart overview shows "Item total: $0" while Tax and Total show
  "$0.00". Is the missing decimal on the item total intentional?
- The first "Add to cart" click right after the page loaded did not register —
  the badge stayed empty and the button stayed "Add to cart". The second click
  worked. This may be a hydration delay rather than a defect, so it is not
  written as a test case. Agent 2 should wait for the product list to be ready
  before the first click, and should report it if it happens again in a clean run.
- "Reset App State" in the side menu was not exercised, to avoid clearing state
  in the middle of the walkthrough.

## Not covered on purpose

- The other five demo accounts (problem_user, performance_glitch_user,
  error_user, visual_user). The scope for this run is smoke on standard_user.
  problem_user and visual_user are known to show broken images and layout and
  would be worth their own run.
- Performance, load and mobile cases — outside the flow by design.
