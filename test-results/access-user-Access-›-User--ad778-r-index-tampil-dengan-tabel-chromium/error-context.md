# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: access-user.spec.ts >> Access › User Management >> halaman user index tampil dengan tabel
- Location: tests/e2e/access-user.spec.ts:16:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "User Management"
Received string:    "404 Not Found"
Timeout: 10000ms

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('h1')
    24 × locator resolved to <h1>404 Not Found</h1>
       - unexpected value "404 Not Found"

```

```yaml
- heading "404 Not Found" [level=1]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { login } from './helpers/auth'
  3   | import { expectToast, confirmAndProceed, clickDropdownItem } from './helpers/ui'
  4   | 
  5   | // ID user yang dibuat pada test 'create' — dipakai oleh test edit & delete
  6   | let createdUserId: string | undefined
  7   | const ts = Date.now()
  8   | const testEmail = `etest${ts}@example.com`
  9   | const testCode = `TC${String(ts).slice(-8)}`
  10  | 
  11  | test.describe('Access › User Management', () => {
  12  |   test.describe.configure({ mode: 'serial' })
  13  | 
  14  |   // ─── Index ───────────────────────────────────────────────────────────────
  15  | 
  16  |   test('halaman user index tampil dengan tabel', async ({ page }) => {
  17  |     await login(page)
  18  |     await page.goto('/admin/v1/access/user')
> 19  |     await expect(page.locator('h1')).toContainText('User Management')
      |                                      ^ Error: expect(locator).toContainText(expected) failed
  20  |     await expect(page.locator('table')).toBeVisible()
  21  |     await expect(page.locator('a:has-text("Add Data")')).toBeVisible()
  22  |   })
  23  | 
  24  |   test('search user berdasarkan email', async ({ page }) => {
  25  |     await login(page)
  26  |     await page.goto('/admin/v1/access/user')
  27  |     await page.fill('input[name="q_email"]', 'admin@')
  28  |     await page.locator('button[type="submit"][form="searchform"]').click()
  29  |     await expect(page).toHaveURL(/q_email=admin/)
  30  |     await expect(page.locator('table')).toBeVisible()
  31  |   })
  32  | 
  33  |   // ─── Create ──────────────────────────────────────────────────────────────
  34  | 
  35  |   test('halaman create user tampil dengan form lengkap', async ({ page }) => {
  36  |     await login(page)
  37  |     await page.goto('/admin/v1/access/user/create')
  38  |     await expect(page.locator('h2')).toContainText('User Form')
  39  |     await expect(page.locator('input[name="code"]')).toBeVisible()
  40  |     await expect(page.locator('input[name="name"]')).toBeVisible()
  41  |     await expect(page.locator('input[name="email"]')).toBeVisible()
  42  |     await expect(page.locator('input[name="password"]')).toBeVisible()
  43  |     await expect(page.locator('select[name="status"]')).toBeVisible()
  44  |   })
  45  | 
  46  |   test('create user sukses → redirect index + toast sukses', async ({ page }) => {
  47  |     await login(page)
  48  |     await page.goto('/admin/v1/access/user/create')
  49  | 
  50  |     await page.fill('input[name="code"]', testCode)
  51  |     await page.fill('input[name="name"]', `E2E Test User ${ts}`)
  52  |     await page.fill('input[name="email"]', testEmail)
  53  |     await page.fill('input[name="phone"]', '081234567890')
  54  |     await page.fill('input[name="password"]', 'Password123!')
  55  |     await page.fill('input[name="password_confirmation"]', 'Password123!')
  56  |     await page.selectOption('select[name="status"]', 'Active')
  57  |     // Pilih role pertama yang tersedia
  58  |     await page.locator('input[name="roles[]"]').first().check()
  59  | 
  60  |     await page.locator('button[type="submit"]').click()
  61  |     await page.waitForURL('**/admin/v1/access/user')
  62  |     await expectToast(page, 'Store User Success.')
  63  | 
  64  |     // Simpan ID user dari link edit pada baris yang baru dibuat
  65  |     const row = page.locator(`tbody tr:has-text("${testEmail}")`)
  66  |     const editLink = row.locator('a[href*="/edit"]')
  67  |     if (await editLink.count() > 0) {
  68  |       // Buka dropdown lalu ambil href edit
  69  |       await row.locator('button[data-toggle-dd]').click()
  70  |       const href = await row.locator('a.dropdown-item[href*="/edit"]').getAttribute('href')
  71  |       createdUserId = href?.match(/\/access\/user\/(\d+)\/edit/)?.[1]
  72  |     }
  73  |   })
  74  | 
  75  |   test('create user validasi gagal → tetap di form + field is-invalid', async ({ page }) => {
  76  |     await login(page)
  77  |     await page.goto('/admin/v1/access/user/create')
  78  |     // Submit tanpa mengisi field wajib (code, name, email, password, roles)
  79  |     await page.locator('button[type="submit"]').click()
  80  |     // Validator gagal → redirect balik ke create
  81  |     await expect(page).toHaveURL(/\/admin\/v1\/access\/user\/create/)
  82  |   })
  83  | 
  84  |   // ─── Edit ────────────────────────────────────────────────────────────────
  85  | 
  86  |   test('halaman edit user tampil dengan data yang sudah terisi', async ({ page }) => {
  87  |     if (!createdUserId) test.skip()
  88  |     await login(page)
  89  |     await page.goto(`/admin/v1/access/user/${createdUserId}/edit`)
  90  |     await expect(page.locator('h2')).toContainText('User Form')
  91  |     // Email sudah terisi dengan data yang dibuat sebelumnya
  92  |     await expect(page.locator('input[name="email"]')).toHaveValue(testEmail)
  93  |     await expect(page.locator('input[name="code"]')).toHaveValue(testCode)
  94  |   })
  95  | 
  96  |   test('update user sukses → redirect index + toast sukses', async ({ page }) => {
  97  |     if (!createdUserId) test.skip()
  98  |     await login(page)
  99  |     await page.goto(`/admin/v1/access/user/${createdUserId}/edit`)
  100 | 
  101 |     await page.fill('input[name="name"]', `E2E Test User Updated ${ts}`)
  102 |     await page.locator('button[type="submit"]').click()
  103 |     await page.waitForURL('**/admin/v1/access/user')
  104 |     await expectToast(page, 'Update User Success.')
  105 |   })
  106 | 
  107 |   // ─── Delete ──────────────────────────────────────────────────────────────
  108 | 
  109 |   test('delete user → confirm dialog → toast sukses', async ({ page }) => {
  110 |     if (!createdUserId) test.skip()
  111 |     await login(page)
  112 |     await page.goto('/admin/v1/access/user')
  113 | 
  114 |     // Temukan baris user berdasarkan email
  115 |     const row = page.locator(`tbody tr:has-text("${testEmail}")`)
  116 |     await expect(row).toBeVisible()
  117 | 
  118 |     // Buka dropdown dan klik Delete
  119 |     await clickDropdownItem(row, 'Delete')
```