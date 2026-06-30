# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setting.spec.ts >> Setting >> memilih swatch tema mengubah pilihan aktif di UI (belum disimpan)
- Location: tests/e2e/setting.spec.ts:26:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('label:has(input[value="Green"])')

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
      - heading "Setting Management" [level=1] [ref=e42]
      - generic [ref=e43]:
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e46]: 
            - heading "Admin Theme" [level=2] [ref=e47]
          - paragraph [ref=e48]: Pilih template — seluruh tampilan admin akan berubah warnanya setelah disimpan.
          - generic [ref=e49]:
            - generic [ref=e50] [cursor=pointer]:
              - radio "blue blue" [ref=e51]
              - generic [ref=e52]:
                - generic [ref=e54]: blue
                - generic [ref=e55]:
                  - generic [ref=e56]: blue
                  - text: 
            - generic [ref=e57] [cursor=pointer]:
              - radio "black black" [ref=e58]
              - generic [ref=e59]:
                - generic [ref=e61]: black
                - generic [ref=e62]:
                  - generic [ref=e63]: black
                  - text: 
            - generic [ref=e64] [cursor=pointer]:
              - radio "brown brown" [ref=e65]
              - generic [ref=e66]:
                - generic [ref=e68]: brown
                - generic [ref=e69]:
                  - generic [ref=e70]: brown
                  - text: 
            - generic [ref=e71] [cursor=pointer]:
              - radio "green green" [ref=e72]
              - generic [ref=e73]:
                - generic [ref=e75]: green
                - generic [ref=e76]:
                  - generic [ref=e77]: green
                  - text: 
            - generic [ref=e78] [cursor=pointer]:
              - radio "grey grey" [ref=e79]
              - generic [ref=e80]:
                - generic [ref=e82]: grey
                - generic [ref=e83]:
                  - generic [ref=e84]: grey
                  - text: 
            - generic [ref=e85] [cursor=pointer]:
              - radio "orange orange" [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e89]: orange
                - generic [ref=e90]:
                  - generic [ref=e91]: orange
                  - text: 
            - generic [ref=e92] [cursor=pointer]:
              - radio "purple purple" [ref=e93]
              - generic [ref=e94]:
                - generic [ref=e96]: purple
                - generic [ref=e97]:
                  - generic [ref=e98]: purple
                  - text: 
            - generic [ref=e99] [cursor=pointer]:
              - radio "red red" [ref=e100]
              - generic [ref=e101]:
                - generic [ref=e103]: red
                - generic [ref=e104]:
                  - generic [ref=e105]: red
                  - text: 
            - generic [ref=e106] [cursor=pointer]:
              - radio "yellow yellow" [ref=e107]
              - generic [ref=e108]:
                - generic [ref=e110]: yellow
                - generic [ref=e111]:
                  - generic [ref=e112]: yellow
                  - text: 
        - generic [ref=e113]:
          - heading "Setting Form" [level=2] [ref=e114]
          - generic [ref=e115]:
            - generic [ref=e116]: App Name [name]
            - textbox "App Name [name]" [ref=e117]: CppAdmin
          - generic [ref=e118]:
            - generic [ref=e119]: Copyright Text [copyright]
            - textbox "Copyright Text [copyright]" [ref=e120]
          - generic [ref=e121]:
            - generic [ref=e122]: Company Logo [logo]
            - button "Company Logo [logo]" [ref=e123]
          - generic [ref=e124]:
            - generic [ref=e125]: Login Image [login_image]
            - button "Login Image [login_image]" [ref=e126]
          - button " Save" [ref=e127] [cursor=pointer]:
            - generic [ref=e128]: 
            - text: Save
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
> 32 |     await page.locator('label:has(input[value="Green"])').click({ force: true })
     |                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  43 |     await page.waitForURL('**/admin/v1/setting')
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