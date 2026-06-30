# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile >> halaman profile tampil dengan data user yang sedang login
- Location: tests/e2e/profile.spec.ts:6:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Profile"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('h1')

```

```yaml
- complementary:
  - link " CppAdmin":
    - /url: /admin/v1/dashboard
  - navigation:
    - link " Dashboard":
      - /url: /admin/v1/dashboard
    - link " UI Components":
      - /url: /admin/v1/components
    - paragraph: Maintenance
    - link " Permission":
      - /url: /admin/v1/access/permissions
    - link " Role":
      - /url: /admin/v1/access/roles
    - link " User":
      - /url: /admin/v1/access/users
    - link " Setting":
      - /url: /admin/v1/setting
  - text: CppAdmin © 2024
- banner:
  - link "":
    - /url: /admin/v1/dashboard
  - link "Welcome,  ":
    - /url: "#"
- main:
  - heading "Profile" [level=2]
  - link "Edit Profile":
    - /url: /admin/v1/profile/edit
  - link "Change Password":
    - /url: /admin/v1/profile/password
  - table:
    - rowgroup:
      - row "Name":
        - columnheader "Name"
        - cell
      - row "Email":
        - columnheader "Email"
        - cell
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { login, ADMIN } from './helpers/auth'
  3  | import { expectToast } from './helpers/ui'
  4  | 
  5  | test.describe('Profile', () => {
  6  |   test('halaman profile tampil dengan data user yang sedang login', async ({ page }) => {
  7  |     await login(page)
  8  |     await page.goto('/admin/v1/profile')
> 9  |     await expect(page.locator('h1')).toContainText('Profile')
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  10 |     await expect(page.locator('h2')).toContainText('User Form')
  11 |     // Email field sudah terisi dengan email admin yang login
  12 |     await expect(page.locator('input[name="email"]')).toHaveValue(ADMIN.email)
  13 |     // Field penting lainnya terlihat
  14 |     await expect(page.locator('input[name="code"]')).toBeVisible()
  15 |     await expect(page.locator('input[name="name"]')).toBeVisible()
  16 |     await expect(page.locator('select[name="status"]')).toBeVisible()
  17 |   })
  18 | 
  19 |   test('update profile sukses → redirect dashboard + toast sukses', async ({ page }) => {
  20 |     await login(page)
  21 |     await page.goto('/admin/v1/profile')
  22 | 
  23 |     // Update nama saja (field lain sudah terisi dari data server)
  24 |     const currentName = await page.locator('input[name="name"]').inputValue()
  25 |     await page.fill('input[name="name"]', currentName || 'Admin Updated')
  26 | 
  27 |     await page.locator('button[type="submit"]').click()
  28 |     await page.waitForURL('**/admin/v1/dashboard')
  29 |     await expectToast(page, 'Update Profile Success.')
  30 | 
  31 |     // Kembalikan nama ke semula
  32 |     await page.goto('/admin/v1/profile')
  33 |     if (currentName) {
  34 |       await page.fill('input[name="name"]', currentName)
  35 |       await page.locator('button[type="submit"]').click()
  36 |       await page.waitForURL('**/admin/v1/dashboard')
  37 |     }
  38 |   })
  39 | 
  40 |   test('form profile memiliki semua field yang diperlukan', async ({ page }) => {
  41 |     await login(page)
  42 |     await page.goto('/admin/v1/profile')
  43 |     await expect(page.locator('input[name="code"]')).toBeVisible()
  44 |     await expect(page.locator('input[name="name"]')).toBeVisible()
  45 |     await expect(page.locator('input[name="email"]')).toBeVisible()
  46 |     await expect(page.locator('input[name="phone"]')).toBeVisible()
  47 |     await expect(page.locator('select[name="timezone"]')).toBeVisible()
  48 |     await expect(page.locator('input[name="password"]')).toBeVisible()
  49 |     await expect(page.locator('input[name="picture"]')).toBeVisible()
  50 |   })
  51 | })
  52 | 
```