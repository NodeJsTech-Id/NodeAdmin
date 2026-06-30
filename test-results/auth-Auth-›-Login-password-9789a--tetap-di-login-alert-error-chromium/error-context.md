# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth › Login >> password salah → tetap di login + alert error
- Location: tests/e2e/auth.spec.ts:24:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.alert-danger')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.alert-danger')

```

```yaml
- text: 
- heading "CppAdmin" [level=2]
- paragraph: Admin Panel
- text:  Email atau password salah.
- heading "Hello, Welcome Back!" [level=1]
- paragraph: Enter your credentials to continue
- text: Email
- textbox "Email":
  - /placeholder: Email address
- text: Password
- textbox "Password"
- button "Login"
- checkbox "Keep me logged in"
- text: Keep me logged in
- link "Forgot password":
  - /url: /admin/v1/auth/reset/req
- separator
- text: Don't have an account?
- link "create here":
  - /url: /auth/signup
```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test'
  2  | 
  3  | // Flash message di halaman admin (main layout) ditampilkan sebagai Toast
  4  | export async function expectToast(page: Page, message: string, type: 'success' | 'error' | 'info' = 'success') {
  5  |   await expect(
  6  |     page.locator(`.toast.${type}.show span`).filter({ hasText: message })
  7  |   ).toBeVisible({ timeout: 5000 })
  8  | }
  9  | 
  10 | // Flash message di halaman full-width (login/register/reset) ditampilkan sebagai .alert-*
  11 | export async function expectAlertSuccess(page: Page, text: string) {
  12 |   await expect(page.locator('.alert-success').filter({ hasText: text })).toBeVisible()
  13 | }
  14 | 
  15 | export async function expectAlertError(page: Page) {
> 16 |   await expect(page.locator('.alert-danger')).toBeVisible()
     |                                               ^ Error: expect(locator).toBeVisible() failed
  17 | }
  18 | 
  19 | // Tunggu custom confirmDialog modal muncul lalu klik "Ya"
  20 | export async function confirmAndProceed(page: Page) {
  21 |   await expect(page.locator('#tw-modal.show')).toBeVisible({ timeout: 5000 })
  22 |   await page.locator('#tw-modal-footer .btn-primary-tw').click()
  23 | }
  24 | 
  25 | // Buka dropdown "Action" di row tabel lalu klik item berdasarkan teks
  26 | export async function clickDropdownItem(row: Locator, itemText: string) {
  27 |   await row.locator('button[data-toggle-dd]').click()
  28 |   await row.locator('.dropdown-item', { hasText: itemText }).click()
  29 | }
  30 | 
  31 | // Logout programatik (submit hidden form #logout-form)
  32 | export async function logout(page: Page) {
  33 |   await page.evaluate(() => (document.getElementById('logout-form') as HTMLFormElement)?.submit())
  34 |   await page.waitForURL('**/auth/login')
  35 | }
  36 | 
```