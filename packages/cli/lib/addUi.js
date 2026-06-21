#!/usr/bin/env node
/**
 * addUi.js — upgrade install NodeAdmin "API-only" → "Full (UI + REST API)".
 *
 * Dijalankan dari root app turunan: `npx nodeadmin add-ui`.
 *
 * Latar: varian api-only = varian full DIKURANGI file UI utuh (lihat
 * tools/buildTemplate.js). Sejak refactor "diff PURELY ADDITIVE", file shared
 * (container.ts, index.ts, SettingService, SettingValidator, env.ts, feTemplates)
 * IDENTIK di kedua varian → upgrade cukup MENAMBAH file UI yang absent, tanpa
 * 3-way merge.
 *
 * Strategi aman:
 *  1. Deteksi: kalau layout UI sudah ada → sudah full → exit 0 (idempotent).
 *  2. Unduh subdir `template` (full) via giget ke direktori sementara.
 *  3. Salin file yang ABSENT di project (UI: public/, layouts, modul home/
 *     components/media, routes/web, controllers/web, views, test UI).
 *  4. File yang SUDAH ADA dan BERBEDA:
 *       - test stub api (`access.user`, `auth`) → ditimpa versi full (web+api).
 *       - shared lain yang beda (install api lama, pra-refactor) → tulis `.new`
 *         agar user merge manual; JANGAN timpa diam-diam.
 *  5. Merge package.json (deps + scripts UI) & .env (APP_MODE=full).
 *  6. Gate verifikasi: npm install → nodeadmin check → tsc → test.
 */
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

const CWD = process.cwd()

// Tag template selaras dengan @flazhost-nodeadmin/create-app. Satu tag mencakup
// kedua subdir (template + template-api).
const TEMPLATE_TAG = 'template-v1.0.12'
const REPO = 'FlazHost-Com/NodeAdmin'

// Test stub yang dikirim varian api (tools/templates/api-tests) — pada upgrade
// HARUS ditimpa versi full (yang menguji web+api). Relatif root project.
const OVERWRITE_ON_UPGRADE = new Set([
    path.normalize('tests/api/access.user.test.ts'),
    path.normalize('tests/api/auth.test.ts'),
].map((p) => p.replace(/\\/g, '/')))

// Deps runtime UI-only yang ditambahkan saat upgrade (dibuang di varian api).
const UI_DEPS = {
    'express-ejs-layouts': '^2.5.1',
    'method-override': '^3.0.0',
}
const UI_DEV_DEPS = {
    '@types/method-override': '^0.0.35',
    '@playwright/test': '^1.45.0',
    '@cucumber/cucumber': '^10.8.0',
}
const UI_SCRIPTS = {
    'test:e2e': 'playwright test',
    'test:bdd': 'cucumber-js',
}

function log(msg) { console.log(msg) }
function warn(msg) { console.warn(msg) }
function fail(msg) { console.error(`✖ ${msg}`); process.exit(1) }

// Deteksi: layout backend hanya ada di varian full.
function alreadyFull() {
    return fs.existsSync(path.join(CWD, 'src/resources/layouts/be'))
}

function looksLikeNodeAdmin() {
    return fs.existsSync(path.join(CWD, 'src/container.ts')) &&
        fs.existsSync(path.join(CWD, 'src/modules')) &&
        fs.existsSync(path.join(CWD, 'package.json'))
}

async function downloadFullTemplate() {
    // Override lokal (dev/test): NODEADMIN_TEMPLATE_DIR menunjuk ke folder
    // `template` lokal → lewati unduhan GitHub. Dipakai verifikasi e2e sebelum
    // tag baru dipublish.
    const localOverride = process.env.NODEADMIN_TEMPLATE_DIR
    if (localOverride) {
        if (!fs.existsSync(localOverride)) fail(`NODEADMIN_TEMPLATE_DIR tidak ada: ${localOverride}`)
        log(`📁 Memakai template lokal: ${localOverride}`)
        return localOverride
    }
    // giget ≥3 = ESM-only → dynamic import (file ini CommonJS). Versi 3.x
    // melepas dependency `tar` rentan → menghilangkan audit high.
    const { downloadTemplate } = await import('giget')
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nodeadmin-ui-'))
    const src = `github:${REPO}/template#${TEMPLATE_TAG}`
    log(`⏬ Mengunduh template UI (${TEMPLATE_TAG}) ...`)
    await downloadTemplate(src, { dir: tmp, force: true })
    return tmp
}

// Walk direktori template; untuk tiap file tentukan aksi.
function* walk(dir, base = dir) {
    for (const name of fs.readdirSync(dir)) {
        const abs = path.join(dir, name)
        const rel = path.relative(base, abs).replace(/\\/g, '/')
        if (fs.statSync(abs).isDirectory()) {
            yield* walk(abs, base)
        } else {
            yield { abs, rel }
        }
    }
}

function sameContent(a, b) {
    try {
        return fs.readFileSync(a).equals(fs.readFileSync(b))
    } catch {
        return false
    }
}

// File yang TIDAK pernah disentuh add-ui (dikelola terpisah / milik user).
function isSkippable(rel) {
    return rel === 'package.json' ||
        rel === '.env' ||
        rel === '.env.example' ||
        rel === 'README.md' ||
        rel === 'package-lock.json' ||
        rel.startsWith('node_modules/') ||
        rel.startsWith('dist/') ||
        rel.startsWith('.git/')
}

function applyFiles(tmpl) {
    const added = []
    const overwritten = []
    const conflicts = []  // ditulis sebagai .new

    for (const { abs, rel } of walk(tmpl)) {
        if (isSkippable(rel)) continue
        const dest = path.join(CWD, rel)

        if (!fs.existsSync(dest)) {
            fs.mkdirSync(path.dirname(dest), { recursive: true })
            fs.copyFileSync(abs, dest)
            added.push(rel)
            continue
        }
        // Sudah ada.
        if (sameContent(abs, dest)) continue  // identik → tak ada aksi

        if (OVERWRITE_ON_UPGRADE.has(rel)) {
            fs.copyFileSync(abs, dest)  // timpa stub api → versi full
            overwritten.push(rel)
        } else {
            // Shared berbeda (mis. install api lama pra-refactor) → .new, jangan timpa.
            fs.copyFileSync(abs, dest + '.new')
            conflicts.push(rel)
        }
    }
    return { added, overwritten, conflicts }
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')) }

function mergePackageJson(tmpl) {
    const dstPath = path.join(CWD, 'package.json')
    const pkg = readJson(dstPath)
    const tmplPkg = fs.existsSync(path.join(tmpl, 'package.json'))
        ? readJson(path.join(tmpl, 'package.json'))
        : { dependencies: {}, devDependencies: {}, scripts: {} }

    pkg.dependencies = pkg.dependencies || {}
    pkg.devDependencies = pkg.devDependencies || {}
    pkg.scripts = pkg.scripts || {}

    const pickVersion = (name, fallback, from) =>
        (from && from[name]) || fallback

    for (const [name, ver] of Object.entries(UI_DEPS)) {
        if (!pkg.dependencies[name]) pkg.dependencies[name] = pickVersion(name, ver, tmplPkg.dependencies)
    }
    for (const [name, ver] of Object.entries(UI_DEV_DEPS)) {
        if (!pkg.devDependencies[name]) pkg.devDependencies[name] = pickVersion(name, ver, tmplPkg.devDependencies)
    }
    for (const [name, cmd] of Object.entries(UI_SCRIPTS)) {
        if (!pkg.scripts[name]) pkg.scripts[name] = (tmplPkg.scripts && tmplPkg.scripts[name]) || cmd
    }

    pkg.dependencies = sortKeys(pkg.dependencies)
    pkg.devDependencies = sortKeys(pkg.devDependencies)
    fs.writeFileSync(dstPath, JSON.stringify(pkg, null, 2) + '\n')
}

function sortKeys(o) {
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]))
}

// Set APP_MODE=full di .env (tambah bila absent). Tak menyentuh nilai lain.
function setEnvFull() {
    const envPath = path.join(CWD, '.env')
    if (!fs.existsSync(envPath)) {
        warn('  .env tidak ditemukan — set APP_MODE=full di .env secara manual.')
        return
    }
    let env = fs.readFileSync(envPath, 'utf8')
    if (/^APP_MODE=/m.test(env)) {
        env = env.replace(/^APP_MODE=.*/m, 'APP_MODE=full')
    } else {
        env = env.replace(/\n*$/, '\n') + 'APP_MODE=full\n'
    }
    fs.writeFileSync(envPath, env)
}

function run(cmd) {
    log(`\n$ ${cmd}`)
    execSync(cmd, { cwd: CWD, stdio: 'inherit' })
}

async function main() {
    if (!looksLikeNodeAdmin()) {
        fail('Ini bukan root project NodeAdmin (tak ada src/container.ts). Jalankan dari root app.')
    }
    if (alreadyFull()) {
        log('✔ Project sudah varian Full (UI + API) — tidak ada yang perlu ditambahkan.')
        process.exit(0)
    }

    log('Project terdeteksi varian API-only → akan ditambahkan lapisan UI (full).')

    let tmpl
    try {
        tmpl = await downloadFullTemplate()
    } catch (err) {
        fail(`Gagal mengunduh template UI: ${err.message}`)
    }

    let result
    const isLocalTmpl = !!process.env.NODEADMIN_TEMPLATE_DIR
    try {
        result = applyFiles(tmpl)
        mergePackageJson(tmpl)
        setEnvFull()
    } finally {
        // Jangan hapus folder override lokal — hanya tmp hasil unduhan.
        if (!isLocalTmpl) fs.rmSync(tmpl, { recursive: true, force: true })
    }

    const { added, overwritten, conflicts } = result
    log(`\n✔ File UI ditambahkan: ${added.length}`)
    if (overwritten.length) log(`  Test stub ditimpa versi full: ${overwritten.length}`)
    if (conflicts.length) {
        warn(`\n⚠ ${conflicts.length} file shared berbeda dari template (kemungkinan install api lama):`)
        for (const c of conflicts) warn(`   ${c}  → ditulis sebagai ${c}.new (merge manual)`)
    }
    log('  package.json: deps & scripts UI ditambahkan. .env: APP_MODE=full.')

    // --- Gate verifikasi ---
    try {
        run('npm install')
        run('npx nodeadmin check')
        run('npx tsc --noEmit')
        run('npm test')
    } catch (err) {
        fail('Verifikasi gagal — periksa output di atas. Perbaiki lalu jalankan `nodeadmin add-ui` lagi (idempotent).')
    }

    log('\n✅ Selesai! UI berhasil ditambahkan.')
    log('Langkah berikutnya:')
    log('  npm run start:dev        # http://localhost:3000')
    log('  Buka /  (landing) · /auth/login · /admin/v1/dashboard · /admin/v1/components')
    log('  Login default: admin@admin.com / 12345678')
    if (conflicts.length) {
        log('\nCatatan: selesaikan file *.new (merge manual) bila ada perubahan lokal di file shared.')
    }
}

main().catch((err) => {
    console.error('✖ Error:', err)
    process.exit(1)
})
