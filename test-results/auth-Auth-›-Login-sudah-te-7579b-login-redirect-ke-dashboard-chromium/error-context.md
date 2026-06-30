# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth › Login >> sudah terautentikasi → akses halaman login redirect ke dashboard
- Location: tests/e2e/auth.spec.ts:18:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/admin\/v1\/dashboard/
Received string:  "http://localhost:3000/auth/login"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × unexpected value "http://localhost:3000/auth/login"

```

```yaml
- text: 
- heading "CppAdmin" [level=2]
- paragraph: Admin Panel
- text: 
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
  1   | import { test, expect } from '@playwright/test'
  2   | import { login, ADMIN } from './helpers/auth'
  3   | import { expectAlertError, logout } from './helpers/ui'
  4   | 
  5   | // ─── Login ────────────────────────────────────────────────────────────────────
  6   | 
  7   | test.describe('Auth › Login', () => {
  8   |   test('login kredensial valid → redirect ke dashboard', async ({ page }) => {
  9   |     await page.goto('/auth/login')
  10  |     await expect(page).toHaveTitle(/Node Admin/i)
  11  |     await page.fill('#email', ADMIN.email)
  12  |     await page.fill('#password', ADMIN.password)
  13  |     await page.click('button[type="submit"]')
  14  |     await page.waitForURL('**/admin/v1/dashboard')
  15  |     await expect(page).toHaveURL(/\/admin\/v1\/dashboard/)
  16  |   })
  17  | 
  18  |   test('sudah terautentikasi → akses halaman login redirect ke dashboard', async ({ page }) => {
  19  |     await login(page)
  20  |     await page.goto('/auth/login')
> 21  |     await expect(page).toHaveURL(/\/admin\/v1\/dashboard/)
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  22  |   })
  23  | 
  24  |   test('password salah → tetap di login + alert error', async ({ page }) => {
  25  |     await page.goto('/auth/login')
  26  |     await page.fill('#email', ADMIN.email)
  27  |     await page.fill('#password', 'salah-password-123')
  28  |     await page.click('button[type="submit"]')
  29  |     await expect(page).toHaveURL(/\/auth\/login/)
  30  |     await expectAlertError(page)
  31  |   })
  32  | 
  33  |   test('email tidak terdaftar → tetap di login + alert error', async ({ page }) => {
  34  |     await page.goto('/auth/login')
  35  |     await page.fill('#email', 'tidakada@example.com')
  36  |     await page.fill('#password', 'anypassword')
  37  |     await page.click('button[type="submit"]')
  38  |     await expect(page).toHaveURL(/\/auth\/login/)
  39  |     await expectAlertError(page)
  40  |   })
  41  | 
  42  |   test('form login memiliki field email dan password', async ({ page }) => {
  43  |     await page.goto('/auth/login')
  44  |     await expect(page.locator('input[name="email"]')).toBeVisible()
  45  |     await expect(page.locator('input[name="password"]')).toBeVisible()
  46  |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  47  |   })
  48  | })
  49  | 
  50  | // ─── Register ─────────────────────────────────────────────────────────────────
  51  | 
  52  | test.describe('Auth › Register', () => {
  53  |   test('halaman register tampil dengan form', async ({ page }) => {
  54  |     await page.goto('/auth/register')
  55  |     await expect(page.locator('h1')).toContainText('Create Account')
  56  |     await expect(page.locator('input[name="name"]')).toBeVisible()
  57  |     await expect(page.locator('input[name="email"]')).toBeVisible()
  58  |     await expect(page.locator('input[name="password"]')).toBeVisible()
  59  |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  60  |   })
  61  | 
  62  |   test('submit form kosong → kembali ke halaman register (validasi gagal)', async ({ page }) => {
  63  |     await page.goto('/auth/register')
  64  |     await page.click('button[type="submit"]')
  65  |     // Validator membutuhkan code/roles/status yang tidak ada di form → redirect balik
  66  |     await expect(page).toHaveURL(/\/auth\/register/)
  67  |   })
  68  | 
  69  |   test('link "Already have an account?" mengarah ke halaman login', async ({ page }) => {
  70  |     await page.goto('/auth/register')
  71  |     await page.locator('a:has-text("Already have an account")').click()
  72  |     await expect(page).toHaveURL(/\/auth\/login/)
  73  |   })
  74  | })
  75  | 
  76  | // ─── Logout ──────────────────────────────────────────────────────────────────
  77  | 
  78  | test.describe('Auth › Logout', () => {
  79  |   test('logout sukses → redirect ke halaman login', async ({ page }) => {
  80  |     await login(page)
  81  |     await logout(page)
  82  |     await expect(page).toHaveURL(/\/auth\/login/)
  83  |   })
  84  | 
  85  |   test('setelah logout akses halaman admin → redirect ke login', async ({ page }) => {
  86  |     await login(page)
  87  |     await logout(page)
  88  |     await page.goto('/admin/v1/dashboard')
  89  |     await expect(page).toHaveURL(/\/auth\/login/)
  90  |   })
  91  | })
  92  | 
  93  | // ─── Reset Password ───────────────────────────────────────────────────────────
  94  | 
  95  | test.describe('Auth › Reset Password', () => {
  96  |   test('halaman request reset tampil dengan form email', async ({ page }) => {
  97  |     await page.goto('/admin/v1/auth/reset/req')
  98  |     await expect(page.locator('h1')).toContainText('Forgot Password')
  99  |     await expect(page.locator('input[name="email"]')).toBeVisible()
  100 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  101 |   })
  102 | 
  103 |   test('request reset email tidak terdaftar → redirect login + alert error', async ({ page }) => {
  104 |     await page.goto('/admin/v1/auth/reset/req')
  105 |     await page.fill('input[name="email"]', 'tidakada@example.com')
  106 |     await page.locator('button[type="submit"]').click()
  107 |     // Controller redirect ke /auth/login dengan error flash bila email tidak ditemukan
  108 |     await expect(page).toHaveURL(/\/auth\/login/)
  109 |     await expectAlertError(page)
  110 |   })
  111 | 
  112 |   test('halaman process reset tampil dengan semua field', async ({ page }) => {
  113 |     await page.goto('/admin/v1/auth/reset/proc')
  114 |     await expect(page.locator('h1')).toContainText('Reset Password')
  115 |     await expect(page.locator('input[name="email"]')).toBeVisible()
  116 |     await expect(page.locator('input[name="otp"]')).toBeVisible()
  117 |     await expect(page.locator('input[name="password"]')).toBeVisible()
  118 |     await expect(page.locator('input[name="password_confirmation"]')).toBeVisible()
  119 |   })
  120 | 
  121 |   test('submit OTP tidak valid → tetap di process reset + alert error', async ({ page }) => {
```