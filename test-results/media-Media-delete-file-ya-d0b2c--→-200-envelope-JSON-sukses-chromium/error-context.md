# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: media.spec.ts >> Media >> delete file yang sudah diunggah → 200 + envelope JSON sukses
- Location: tests/e2e/media.spec.ts:56:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 404
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
      - link "Welcome, Administrator  " [ref=e35] [cursor=pointer]:
        - /url: "#"
        - generic [ref=e36]: Welcome, Administrator
        - generic [ref=e38]: 
        - generic [ref=e39]: 
    - main [ref=e40]:
      - generic [ref=e42]:
        - heading "Dashboard Overview" [level=1] [ref=e43]
        - paragraph [ref=e44]:
          - text: Selamat datang kembali,
          - strong [ref=e45]: Administrator
          - text: "! Berikut ringkasan hari ini."
      - generic [ref=e46]:
        - generic [ref=e48]:
          - generic [ref=e49]:
            - paragraph [ref=e50]: Total Users
            - paragraph [ref=e51]: "0"
            - paragraph [ref=e52]: pengguna terdaftar
          - generic [ref=e54]: 
        - generic [ref=e56]:
          - generic [ref=e57]:
            - paragraph [ref=e58]: Roles
            - paragraph [ref=e59]: "0"
            - paragraph [ref=e60]: peran akses
          - generic [ref=e62]: 
        - generic [ref=e64]:
          - generic [ref=e65]:
            - paragraph [ref=e66]: Permissions
            - paragraph [ref=e67]: "0"
            - paragraph [ref=e68]: izin terdaftar
          - generic [ref=e70]: 
        - generic [ref=e72]:
          - generic [ref=e73]:
            - paragraph [ref=e74]: Theme Aktif
            - paragraph [ref=e75]: blue
            - paragraph [ref=e76]: template
          - generic [ref=e78]: 
      - generic [ref=e79]:
        - heading "Sales Overview" [level=3] [ref=e82]
        - heading "Traffic Sources" [level=3] [ref=e87]
      - generic [ref=e90]:
        - generic [ref=e91]:
          - heading "Recent Activities" [level=3] [ref=e92]
          - generic [ref=e93]:
            - generic [ref=e94]:
              - generic [ref=e96]: 
              - generic [ref=e97]:
                - paragraph [ref=e98]: System started
                - paragraph [ref=e99]: CppAdmin running
            - generic [ref=e100]:
              - generic [ref=e102]: 
              - generic [ref=e103]:
                - paragraph [ref=e104]: Database connected
                - paragraph [ref=e105]: SQLite OK
            - generic [ref=e106]:
              - generic [ref=e108]: 
              - generic [ref=e109]:
                - paragraph [ref=e110]: RBAC active
                - paragraph [ref=e111]: Route permissions loaded
        - generic [ref=e112]:
          - heading "Quick Links" [level=3] [ref=e113]
          - generic [ref=e114]:
            - link " Manage Users 0 users total " [ref=e115] [cursor=pointer]:
              - /url: /admin/v1/access/users
              - generic [ref=e117]: 
              - generic [ref=e118]:
                - heading "Manage Users" [level=4] [ref=e119]
                - paragraph [ref=e120]: 0 users total
              - generic [ref=e121]: 
            - link " Manage Roles 0 roles total " [ref=e122] [cursor=pointer]:
              - /url: /admin/v1/access/roles
              - generic [ref=e124]: 
              - generic [ref=e125]:
                - heading "Manage Roles" [level=4] [ref=e126]
                - paragraph [ref=e127]: 0 roles total
              - generic [ref=e128]: 
            - 'link " App Settings Theme: blue " [ref=e129] [cursor=pointer]':
              - /url: /admin/v1/setting
              - generic [ref=e131]: 
              - generic [ref=e132]:
                - heading "App Settings" [level=4] [ref=e133]
                - paragraph [ref=e134]: "Theme: blue"
              - generic [ref=e135]: 
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { login } from './helpers/auth'
  3  | 
  4  | test.describe('Media', () => {
  5  |   test('media list (authenticated) → 200 + envelope JSON dengan data array', async ({ page }) => {
  6  |     await login(page)
  7  | 
  8  |     // page.request mewarisi cookie session browser yang sama
  9  |     const response = await page.request.get('/admin/v1/media/list')
  10 |     expect(response.status()).toBe(200)
  11 | 
  12 |     const body = await response.json()
  13 |     expect(body).toHaveProperty('status', true)
  14 |     expect(body).toHaveProperty('data')
  15 |     expect(Array.isArray(body.data)).toBeTruthy()
  16 |   })
  17 | 
  18 |   test('media list tanpa login → 302 redirect ke halaman login', async ({ page }) => {
  19 |     // Tidak login — request langsung tanpa session
  20 |     const response = await page.request.get('/admin/v1/media/list', {
  21 |       maxRedirects: 0,
  22 |     })
  23 |     // ensureAuthenticated middleware redirect ke /auth/login
  24 |     expect(response.status()).toBe(302)
  25 |     const location = response.headers()['location'] ?? ''
  26 |     expect(location).toMatch(/\/auth\/login/)
  27 |   })
  28 | 
  29 |   test('upload file gambar → 201 + envelope JSON dengan data file', async ({ page }) => {
  30 |     await login(page)
  31 | 
  32 |     // Buat file PNG 1x1 pixel minimal sebagai test fixture
  33 |     const minimalPng = Buffer.from(
  34 |       'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  35 |       'base64'
  36 |     )
  37 | 
  38 |     const response = await page.request.post('/admin/v1/media/upload', {
  39 |       multipart: {
  40 |         file: {
  41 |           name: `e2e-test-${Date.now()}.png`,
  42 |           mimeType: 'image/png',
  43 |           buffer: minimalPng,
  44 |         },
  45 |       },
  46 |     })
  47 | 
  48 |     expect(response.status()).toBe(201)
  49 |     const body = await response.json()
  50 |     expect(body).toHaveProperty('status', true)
  51 |     expect(body).toHaveProperty('data')
  52 |     // Data berisi informasi file yang diunggah
  53 |     expect(body.data).toHaveProperty('url')
  54 |   })
  55 | 
  56 |   test('delete file yang sudah diunggah → 200 + envelope JSON sukses', async ({ page }) => {
  57 |     await login(page)
  58 | 
  59 |     // Upload dulu untuk mendapatkan key file
  60 |     const minimalPng = Buffer.from(
  61 |       'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  62 |       'base64'
  63 |     )
  64 |     const fileName = `e2e-del-${Date.now()}.png`
  65 | 
  66 |     const uploadRes = await page.request.post('/admin/v1/media/upload', {
  67 |       multipart: {
  68 |         file: {
  69 |           name: fileName,
  70 |           mimeType: 'image/png',
  71 |           buffer: minimalPng,
  72 |         },
  73 |       },
  74 |     })
> 75 |     expect(uploadRes.status()).toBe(201)
     |                                ^ Error: expect(received).toBe(expected) // Object.is equality
  76 |     const uploaded = await uploadRes.json()
  77 |     const fileKey = uploaded.data?.key ?? fileName
  78 | 
  79 |     // Hapus file yang baru diunggah
  80 |     const deleteRes = await page.request.post('/admin/v1/media/delete', {
  81 |       data: { key: fileKey },
  82 |     })
  83 |     expect(deleteRes.status()).toBe(200)
  84 |     const deleteBody = await deleteRes.json()
  85 |     expect(deleteBody).toHaveProperty('status', true)
  86 |   })
  87 | })
  88 | 
```