# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: access-permission.spec.ts >> Access › Permission Management >> halaman permission index tampil dengan tabel
- Location: tests/e2e/access-permission.spec.ts:14:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Permission Management"
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
  5   | let createdPermissionId: string | undefined
  6   | const ts = Date.now()
  7   | const permName = `e2e.permission.${ts}`
  8   | 
  9   | test.describe('Access › Permission Management', () => {
  10  |   test.describe.configure({ mode: 'serial' })
  11  | 
  12  |   // ─── Index ───────────────────────────────────────────────────────────────
  13  | 
  14  |   test('halaman permission index tampil dengan tabel', async ({ page }) => {
  15  |     await login(page)
  16  |     await page.goto('/admin/v1/access/permission')
> 17  |     await expect(page.locator('h1')).toContainText('Permission Management')
      |                                      ^ Error: expect(locator).toContainText(expected) failed
  18  |     await expect(page.locator('table')).toBeVisible()
  19  |     await expect(page.locator('a:has-text("Add Data")')).toBeVisible()
  20  |   })
  21  | 
  22  |   test('search permission berdasarkan nama', async ({ page }) => {
  23  |     await login(page)
  24  |     await page.goto('/admin/v1/access/permission')
  25  |     await page.fill('input[name="q_name"]', 'admin')
  26  |     await page.locator('button[type="submit"][form="searchform"]').click()
  27  |     await expect(page).toHaveURL(/q_name=admin/)
  28  |     await expect(page.locator('table')).toBeVisible()
  29  |   })
  30  | 
  31  |   test('filter permission berdasarkan guard', async ({ page }) => {
  32  |     await login(page)
  33  |     await page.goto('/admin/v1/access/permission')
  34  |     await page.selectOption('select[name="q_guard"]', 'web')
  35  |     await page.locator('button[type="submit"][form="searchform"]').click()
  36  |     await expect(page).toHaveURL(/q_guard=web/)
  37  |   })
  38  | 
  39  |   // ─── Create ──────────────────────────────────────────────────────────────
  40  | 
  41  |   test('halaman create permission tampil dengan form', async ({ page }) => {
  42  |     await login(page)
  43  |     await page.goto('/admin/v1/access/permission/create')
  44  |     await expect(page.locator('h2')).toContainText('Permission Form')
  45  |     await expect(page.locator('input[name="name"]')).toBeVisible()
  46  |     await expect(page.locator('input[name="method"]')).toBeVisible()
  47  |     await expect(page.locator('select[name="guard_name"]')).toBeVisible()
  48  |     await expect(page.locator('select[name="status"]')).toBeVisible()
  49  |   })
  50  | 
  51  |   test('create permission sukses → redirect index + toast sukses', async ({ page }) => {
  52  |     await login(page)
  53  |     await page.goto('/admin/v1/access/permission/create')
  54  | 
  55  |     await page.fill('input[name="name"]', permName)
  56  |     await page.selectOption('select[name="guard_name"]', 'web')
  57  |     await page.fill('input[name="method"]', 'GET')
  58  |     await page.fill('input[name="desc"]', `E2E test permission ${ts}`)
  59  |     await page.selectOption('select[name="status"]', 'Active')
  60  | 
  61  |     await page.locator('button[type="submit"]').click()
  62  |     await page.waitForURL('**/admin/v1/access/permission')
  63  |     await expectToast(page, 'Store Permission Success.')
  64  | 
  65  |     // Ambil ID dari link edit pada baris yang baru dibuat
  66  |     const row = page.locator(`tbody tr:has-text("${permName}")`)
  67  |     await row.locator('button[data-toggle-dd]').click()
  68  |     const href = await row.locator('a.dropdown-item[href*="/edit"]').getAttribute('href')
  69  |     createdPermissionId = href?.match(/\/access\/permission\/(\d+)\/edit/)?.[1]
  70  |   })
  71  | 
  72  |   test('create permission validasi gagal (name kosong) → tetap di form + is-invalid', async ({ page }) => {
  73  |     await login(page)
  74  |     await page.goto('/admin/v1/access/permission/create')
  75  |     // Submit tanpa mengisi name dan method
  76  |     await page.selectOption('select[name="status"]', 'Active')
  77  |     await page.locator('button[type="submit"]').click()
  78  |     await expect(page).toHaveURL(/\/admin\/v1\/access\/permission\/create/)
  79  |     await expect(page.locator('.is-invalid')).toBeVisible()
  80  |   })
  81  | 
  82  |   // ─── Edit ────────────────────────────────────────────────────────────────
  83  | 
  84  |   test('halaman edit permission tampil dengan data yang sudah terisi', async ({ page }) => {
  85  |     if (!createdPermissionId) test.skip()
  86  |     await login(page)
  87  |     await page.goto(`/admin/v1/access/permission/${createdPermissionId}/edit`)
  88  |     await expect(page.locator('h2')).toContainText('Permission Form')
  89  |     await expect(page.locator('input[name="name"]')).toHaveValue(permName)
  90  |     await expect(page.locator('input[name="method"]')).toHaveValue('GET')
  91  |   })
  92  | 
  93  |   test('update permission sukses → redirect index + toast sukses', async ({ page }) => {
  94  |     if (!createdPermissionId) test.skip()
  95  |     await login(page)
  96  |     await page.goto(`/admin/v1/access/permission/${createdPermissionId}/edit`)
  97  | 
  98  |     await page.fill('input[name="desc"]', `Updated desc ${ts}`)
  99  |     await page.locator('button[type="submit"]').click()
  100 |     await page.waitForURL('**/admin/v1/access/permission')
  101 |     await expectToast(page, 'Update Permission Success.')
  102 |   })
  103 | 
  104 |   // ─── Delete ──────────────────────────────────────────────────────────────
  105 | 
  106 |   test('delete permission → confirm dialog → toast sukses', async ({ page }) => {
  107 |     if (!createdPermissionId) test.skip()
  108 |     await login(page)
  109 |     await page.goto('/admin/v1/access/permission')
  110 | 
  111 |     const row = page.locator(`tbody tr:has-text("${permName}")`)
  112 |     await expect(row).toBeVisible()
  113 | 
  114 |     await clickDropdownItem(row, 'Delete')
  115 |     await confirmAndProceed(page)
  116 | 
  117 |     await page.waitForURL('**/admin/v1/access/permission')
```