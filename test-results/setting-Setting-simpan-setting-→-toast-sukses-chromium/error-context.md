# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setting.spec.ts >> Setting >> simpan setting → toast sukses
- Location: tests/e2e/setting.spec.ts:36:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/admin/v1/setting" until "load"
============================================================
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { login } from './helpers/auth'
  3  | import { expectToast } from './helpers/ui'
  4  | 
  5  | test.describe('Setting', () => {
  6  |   test('halaman setting tampil dengan semua kartu konfigurasi', async ({ page }) => {
  7  |     await login(page)
  8  |     await page.goto('/admin/v1/setting')
  9  |     await expect(page.locator('h1')).toContainText('Setting Management')
  10 |     // Kartu Admin Theme
  11 |     await expect(page.locator('h2:has-text("Admin Theme")')).toBeVisible()
  12 |     // Kartu Frontend Template
  13 |     await expect(page.locator('h2:has-text("Frontend Template")')).toBeVisible()
  14 |     // Tombol save
  15 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  16 |   })
  17 | 
  18 |   test('halaman setting menampilkan 9 swatch tema', async ({ page }) => {
  19 |     await login(page)
  20 |     await page.goto('/admin/v1/setting')
  21 |     await expect(page.locator('input[name="theme"]')).toHaveCount(9)
  22 |     // Satu tema aktif
  23 |     await expect(page.locator('input[name="theme"]:checked')).toHaveCount(1)
  24 |   })
  25 | 
  26 |   test('memilih swatch tema mengubah pilihan aktif di UI (belum disimpan)', async ({ page }) => {
  27 |     await login(page)
  28 |     await page.goto('/admin/v1/setting')
  29 |     await page.waitForLoadState('networkidle')
  30 | 
  31 |     // Klik swatch tema "Green"
  32 |     await page.locator('label:has(input[value="Green"])').click({ force: true })
  33 |     await expect(page.locator('input[name="theme"][value="Green"]')).toBeChecked()
  34 |   })
  35 | 
  36 |   test('simpan setting → toast sukses', async ({ page }) => {
  37 |     await login(page)
  38 |     await page.goto('/admin/v1/setting')
  39 |     await page.waitForLoadState('networkidle')
  40 | 
  41 |     // Klik save tanpa mengubah apapun → tetap valid
  42 |     await page.locator('button[type="submit"]').first().click()
> 43 |     await page.waitForURL('**/admin/v1/setting')
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  44 |     await expectToast(page, 'Save Setting Success.')
  45 |   })
  46 | 
  47 |   test('search frontend template catalog berfungsi', async ({ page }) => {
  48 |     await login(page)
  49 |     await page.goto('/admin/v1/setting')
  50 | 
  51 |     // Isi form pencarian template
  52 |     await page.fill('input[name="q_name"]', 'agency')
  53 |     await page.locator('button:has-text("Cari")').click()
  54 | 
  55 |     await expect(page).toHaveURL(/q_name=agency/)
  56 |     // Tabel/grid template masih tampil
  57 |     await expect(page.locator('h2:has-text("Frontend Template")')).toBeVisible()
  58 |   })
  59 | 
  60 |   test('filter kategori template berfungsi', async ({ page }) => {
  61 |     await login(page)
  62 |     await page.goto('/admin/v1/setting')
  63 | 
  64 |     // Pilih kategori dari dropdown jika ada pilihan
  65 |     const categorySelect = page.locator('select[name="q_category"]')
  66 |     const optionCount = await categorySelect.locator('option').count()
  67 |     if (optionCount > 1) {
  68 |       // Pilih opsi kedua (bukan "Semua kategori")
  69 |       const secondOption = await categorySelect.locator('option').nth(1).getAttribute('value')
  70 |       if (secondOption) {
  71 |         await categorySelect.selectOption(secondOption)
  72 |         await page.locator('button:has-text("Cari")').click()
  73 |         await expect(page).toHaveURL(new RegExp(`q_category=${encodeURIComponent(secondOption)}`))
  74 |       }
  75 |     }
  76 |   })
  77 | })
  78 | 
```