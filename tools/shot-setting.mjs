import { chromium } from 'playwright'

const BASE = process.env.SHOT_BASE || 'http://localhost:3500'
const OUT = process.env.SHOT_OUT || 'docs/screenshots/setting.png'
const ADMIN = { email: 'admin@admin.com', password: '12345678' }

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1600 }, deviceScaleFactor: 2 })

// Login
await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' })
await page.fill('#email', ADMIN.email)
await page.fill('#password', ADMIN.password)
await page.click('button[type="submit"]')
await page.waitForURL('**/admin/v1/dashboard', { timeout: 30000 })

// Setting page
await page.goto(`${BASE}/admin/v1/setting`, { waitUntil: 'domcontentloaded' })

// Tunggu thumbnail iframe terisi (lazy via IntersectionObserver) — scroll lalu beri waktu fetch+render.
await page.evaluate(async () => {
  const cards = document.querySelector('.fe-card')
  if (cards) cards.scrollIntoView({ block: 'center' })
})
await page.waitForFunction(() => document.querySelectorAll('.fe-thumb iframe').length >= 4, { timeout: 20000 }).catch(() => {})
await page.waitForTimeout(3500) // beri waktu Tailwind CDN dalam iframe me-render

await page.screenshot({ path: OUT, fullPage: true })
console.log('saved', OUT)

// Landing page publik
const LANDING_OUT = process.env.LANDING_OUT || 'docs/screenshots/landing.png'
await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500) // Tailwind CDN + motion.js init

// Scroll bertahap ke bawah → picu animasi reveal (IntersectionObserver/motion).
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const step = Math.round(window.innerHeight * 0.7)
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y); await sleep(250)
  }
  window.scrollTo(0, document.body.scrollHeight); await sleep(400)
  // Paksa elemen yang masih tersembunyi (animasi belum terpicu) jadi terlihat.
  document.querySelectorAll('[data-animate],[data-motion]').forEach((el) => {
    el.style.opacity = '1'; el.style.transform = 'none'; el.style.visibility = 'visible'
  })
  window.scrollTo(0, 0); await sleep(400)
})
await page.waitForTimeout(800)
await page.screenshot({ path: LANDING_OUT, fullPage: true })
console.log('saved', LANDING_OUT)

await browser.close()
