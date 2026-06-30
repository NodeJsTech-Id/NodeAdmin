# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile >> update profile sukses → redirect dashboard + toast sukses
- Location: tests/e2e/profile.spec.ts:19:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.inputValue: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="name"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - complementary [ref=e2]:
    - link " CppAdmin" [ref=e3] [cursor=pointer]:
      - /url: /admin/v1/dashboard
      - generic [ref=e5]: 
      - generic [ref=e6]: CppAdmin
    - navigation [ref=e7]:
      - link " Dashboard" [ref=e8] [cursor=pointer]:
        - /url: /admin/v1/dashboard
        - generic [ref=e9]: 
        - generic [ref=e10]: Dashboard
      - link " UI Components" [ref=e11] [cursor=pointer]:
        - /url: /admin/v1/components
        - generic [ref=e12]: 
        - generic [ref=e13]: UI Components
      - paragraph [ref=e14]: Maintenance
      - link " Permission" [ref=e15] [cursor=pointer]:
        - /url: /admin/v1/access/permissions
        - generic [ref=e16]: 
        - generic [ref=e17]: Permission
      - link " Role" [ref=e18] [cursor=pointer]:
        - /url: /admin/v1/access/roles
        - generic [ref=e19]: 
        - generic [ref=e20]: Role
      - link " User" [ref=e21] [cursor=pointer]:
        - /url: /admin/v1/access/users
        - generic [ref=e22]: 
        - generic [ref=e23]: User
      - link " Setting" [ref=e24] [cursor=pointer]:
        - /url: /admin/v1/setting
        - generic [ref=e25]: 
        - generic [ref=e26]: Setting
    - generic [ref=e27]: CppAdmin © 2024
  - generic [ref=e28]:
    - banner [ref=e30]:
      - generic [ref=e31]:
        - text: 
        - link "" [ref=e32] [cursor=pointer]:
          - /url: /admin/v1/dashboard
          - generic [ref=e33]: 
      - link "Welcome,  " [ref=e35] [cursor=pointer]:
        - /url: "#"
        - generic [ref=e36]: Welcome,
        - generic [ref=e38]: 
        - generic [ref=e39]: 
    - main [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]:
          - heading "Profile" [level=2] [ref=e43]
          - generic [ref=e44]:
            - link "Edit Profile" [ref=e45] [cursor=pointer]:
              - /url: /admin/v1/profile/edit
            - link "Change Password" [ref=e46] [cursor=pointer]:
              - /url: /admin/v1/profile/password
        - table [ref=e47]:
          - rowgroup [ref=e48]:
            - row "Name" [ref=e49]:
              - columnheader "Name" [ref=e50]
              - cell [ref=e51]
            - row "Email" [ref=e52]:
              - columnheader "Email" [ref=e53]
              - cell [ref=e54]
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
  9  |     await expect(page.locator('h1')).toContainText('Profile')
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
> 24 |     const currentName = await page.locator('input[name="name"]').inputValue()
     |                                                                  ^ Error: locator.inputValue: Test timeout of 30000ms exceeded.
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