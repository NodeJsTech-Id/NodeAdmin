# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: access-role.spec.ts >> Access › Role Management >> halaman role index tampil dengan tabel
- Location: tests/e2e/access-role.spec.ts:14:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Role Management"
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
  5   | let createdRoleId: string | undefined
  6   | const ts = Date.now()
  7   | const roleName = `E2E Role ${ts}`
  8   | 
  9   | test.describe('Access › Role Management', () => {
  10  |   test.describe.configure({ mode: 'serial' })
  11  | 
  12  |   // ─── Index ───────────────────────────────────────────────────────────────
  13  | 
  14  |   test('halaman role index tampil dengan tabel', async ({ page }) => {
  15  |     await login(page)
  16  |     await page.goto('/admin/v1/access/role')
> 17  |     await expect(page.locator('h1')).toContainText('Role Management')
      |                                      ^ Error: expect(locator).toContainText(expected) failed
  18  |     await expect(page.locator('table')).toBeVisible()
  19  |     await expect(page.locator('a:has-text("Add Data")')).toBeVisible()
  20  |   })
  21  | 
  22  |   test('search role berdasarkan nama', async ({ page }) => {
  23  |     await login(page)
  24  |     await page.goto('/admin/v1/access/role')
  25  |     await page.fill('input[name="q_name"]', 'Admin')
  26  |     await page.locator('button[type="submit"][form="searchform"]').click()
  27  |     await expect(page).toHaveURL(/q_name=Admin/)
  28  |     await expect(page.locator('table')).toBeVisible()
  29  |   })
  30  | 
  31  |   // ─── Create ──────────────────────────────────────────────────────────────
  32  | 
  33  |   test('halaman create role tampil dengan form', async ({ page }) => {
  34  |     await login(page)
  35  |     await page.goto('/admin/v1/access/role/create')
  36  |     await expect(page.locator('h2')).toContainText('Role Form')
  37  |     await expect(page.locator('input[name="name"]')).toBeVisible()
  38  |     await expect(page.locator('select[name="status"]')).toBeVisible()
  39  |   })
  40  | 
  41  |   test('create role sukses → redirect index + toast sukses', async ({ page }) => {
  42  |     await login(page)
  43  |     await page.goto('/admin/v1/access/role/create')
  44  | 
  45  |     await page.fill('input[name="name"]', roleName)
  46  |     await page.fill('input[name="desc"]', `E2E test role created at ${ts}`)
  47  |     await page.selectOption('select[name="status"]', 'Active')
  48  | 
  49  |     await page.locator('button[type="submit"]').click()
  50  |     await page.waitForURL('**/admin/v1/access/role')
  51  |     await expectToast(page, 'Store Role Success.')
  52  | 
  53  |     // Ambil ID dari link edit pada baris yang baru dibuat
  54  |     const row = page.locator(`tbody tr:has-text("${roleName}")`)
  55  |     await row.locator('button[data-toggle-dd]').click()
  56  |     const href = await row.locator('a.dropdown-item[href*="/edit"]').getAttribute('href')
  57  |     createdRoleId = href?.match(/\/access\/role\/(\d+)\/edit/)?.[1]
  58  |   })
  59  | 
  60  |   test('create role validasi gagal (name kosong) → tetap di form + is-invalid', async ({ page }) => {
  61  |     await login(page)
  62  |     await page.goto('/admin/v1/access/role/create')
  63  |     // Submit tanpa nama
  64  |     await page.selectOption('select[name="status"]', 'Active')
  65  |     await page.locator('button[type="submit"]').click()
  66  |     // Validator express-validator redirect balik ke create
  67  |     await expect(page).toHaveURL(/\/admin\/v1\/access\/role\/create/)
  68  |     await expect(page.locator('.is-invalid')).toBeVisible()
  69  |   })
  70  | 
  71  |   // ─── Edit ────────────────────────────────────────────────────────────────
  72  | 
  73  |   test('halaman edit role tampil dengan data yang sudah terisi', async ({ page }) => {
  74  |     if (!createdRoleId) test.skip()
  75  |     await login(page)
  76  |     await page.goto(`/admin/v1/access/role/${createdRoleId}/edit`)
  77  |     await expect(page.locator('h2')).toContainText('Role Form')
  78  |     await expect(page.locator('input[name="name"]')).toHaveValue(roleName)
  79  |   })
  80  | 
  81  |   test('update role sukses → redirect index + toast sukses', async ({ page }) => {
  82  |     if (!createdRoleId) test.skip()
  83  |     await login(page)
  84  |     await page.goto(`/admin/v1/access/role/${createdRoleId}/edit`)
  85  |     await page.fill('input[name="name"]', `${roleName} Updated`)
  86  |     await page.locator('button[type="submit"]').click()
  87  |     await page.waitForURL('**/admin/v1/access/role')
  88  |     await expectToast(page, 'Update Role Success.')
  89  |   })
  90  | 
  91  |   // ─── Permission Assign/Unassign ──────────────────────────────────────────
  92  | 
  93  |   test('halaman permission role tampil dengan daftar permission', async ({ page }) => {
  94  |     if (!createdRoleId) test.skip()
  95  |     await login(page)
  96  |     await page.goto(`/admin/v1/access/role/${createdRoleId}/permission`)
  97  |     await expect(page.locator('h2')).toContainText('Permission List')
  98  |     await expect(page.locator('table')).toBeVisible()
  99  |   })
  100 | 
  101 |   test('assign permission ke role → toast sukses', async ({ page }) => {
  102 |     if (!createdRoleId) test.skip()
  103 |     await login(page)
  104 |     await page.goto(`/admin/v1/access/role/${createdRoleId}/permission`)
  105 | 
  106 |     // Klik Assign di baris permission pertama yang tersedia
  107 |     const firstRow = page.locator('tbody tr').first()
  108 |     await clickDropdownItem(firstRow, 'Assign')
  109 | 
  110 |     // Controller redirect kembali ke halaman permission dengan toast sukses
  111 |     await expectToast(page, 'Assign Permission Success.')
  112 |   })
  113 | 
  114 |   test('unassign permission dari role → toast sukses', async ({ page }) => {
  115 |     if (!createdRoleId) test.skip()
  116 |     await login(page)
  117 |     await page.goto(`/admin/v1/access/role/${createdRoleId}/permission`)
```