# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth › Reset Password >> submit OTP tidak valid → tetap di process reset + alert error
- Location: tests/e2e/auth.spec.ts:121:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="password"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]: Reset Password
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Email
      - textbox "email@example.com" [ref=e7]: admin@admin.com
    - generic [ref=e8]:
      - generic [ref=e9]: OTP (6 digit)
      - textbox "123456" [active] [ref=e10]: "000000"
    - generic [ref=e11]:
      - generic [ref=e12]: Password Baru
      - textbox "min. 8 karakter" [ref=e13]
    - button "Reset Password" [ref=e14] [cursor=pointer]
  - generic [ref=e15]:
    - link "← Minta OTP baru" [ref=e16] [cursor=pointer]:
      - /url: /admin/v1/auth/reset/req
    - text: "|"
    - link "Login" [ref=e17] [cursor=pointer]:
      - /url: /auth/login
```

# Test source

```ts
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
  122 |     await page.goto('/admin/v1/auth/reset/proc')
  123 |     await page.fill('input[name="email"]', ADMIN.email)
  124 |     await page.fill('input[name="otp"]', '000000')
> 125 |     await page.fill('input[name="password"]', 'NewPassword123!')
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  126 |     await page.fill('input[name="password_confirmation"]', 'NewPassword123!')
  127 |     await page.locator('button[type="submit"]').click()
  128 |     await expect(page).toHaveURL(/\/admin\/v1\/auth\/reset\/proc/)
  129 |     await expectAlertError(page)
  130 |   })
  131 | })
  132 | 
  133 | // ─── Guard ────────────────────────────────────────────────────────────────────
  134 | 
  135 | test.describe('Auth › Guard', () => {
  136 |   test('akses user management tanpa login → redirect login', async ({ page }) => {
  137 |     await page.goto('/admin/v1/access/user')
  138 |     await expect(page).toHaveURL(/\/auth\/login/)
  139 |   })
  140 | 
  141 |   test('akses dashboard tanpa login → redirect login', async ({ page }) => {
  142 |     await page.goto('/admin/v1/dashboard')
  143 |     await expect(page).toHaveURL(/\/auth\/login/)
  144 |   })
  145 | 
  146 |   test('akses setting tanpa login → redirect login', async ({ page }) => {
  147 |     await page.goto('/admin/v1/setting')
  148 |     await expect(page).toHaveURL(/\/auth\/login/)
  149 |   })
  150 | 
  151 |   test('akses profile tanpa login → redirect login', async ({ page }) => {
  152 |     await page.goto('/admin/v1/profile')
  153 |     await expect(page).toHaveURL(/\/auth\/login/)
  154 |   })
  155 | })
  156 | 
```