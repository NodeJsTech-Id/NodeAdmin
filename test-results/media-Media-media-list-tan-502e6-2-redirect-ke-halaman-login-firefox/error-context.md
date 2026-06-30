# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: media.spec.ts >> Media >> media list tanpa login → 302 redirect ke halaman login
- Location: tests/e2e/media.spec.ts:18:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 302
Received: 404
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
> 24 |     expect(response.status()).toBe(302)
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
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
  75 |     expect(uploadRes.status()).toBe(201)
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