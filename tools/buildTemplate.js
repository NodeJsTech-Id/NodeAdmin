#!/usr/bin/env node
/**
 * buildTemplate.js — generate folder `template/` (aplikasi NodeAdmin standalone)
 * dari root monorepo, untuk dikonsumsi oleh @flazhost-nodeadmin/create-app via giget.
 *
 * Sumber kebenaran tetap di root (src/, public/, dst). Skrip ini menyalin bagian
 * aplikasi lalu menulis ulang package.json + .env.example agar standalone:
 *  - tanpa workspaces / packages lokal (core & cli ditarik dari npm),
 *  - default DB SQLite (zero-setup),
 *  - scripts bebas dari `build:core` / `pretest` workspace.
 *
 * Jalankan: npm run build:template
 */
const fs = require('fs')
const path = require('path')
const { buildCleanReadme } = require('./lib/readme')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'template')
const OUT_API = path.join(ROOT, 'template-api')

// Versi paket factory yang ditargetkan template (caret range).
const CORE_RANGE = '^1.3'
const CLI_RANGE = '^1.2'

// Entri root yang DISALIN apa adanya ke template.
// CATATAN: `spec/` & materi porting TIDAK disalin — itu materi "pabrik" untuk
// mem-porting NodeAdmin ke bahasa lain, tak relevan untuk app turunan Node.
const COPY = [
    'src',
    'public',
    'tests',
    'docs',
    'tsconfig.json',
    'nodemon.json',   // watch hanya src/ + ignore cache fe/templates (cegah restart-loop)
    'jest.config.js',
    'cucumber.cjs',
    'playwright.config.ts',
    '.env.test',
    '.gitignore',
    // Panduan AI & skill (agar /make-module + konvensi ikut di app turunan).
    'AGENTS.md',
    'CLAUDE.md',
    '.cursorrules',
    '.claude',
]

// Yang TIDAK pernah disalin (monorepo-only / artefak / rahasia / env-specific).
const EXCLUDE = new Set([
    'node_modules', 'dist', 'coverage', 'test-results',
    'packages', '.changeset', '.github', '.git',
    '.env', 'package-lock.json', 'template',
    // Setting Claude Code lokal mesin — jangan ikut ke app turunan.
    'settings.local.json',
])

// Path spesifik (relatif ROOT) yang dikecualikan — materi porting bahasa lain.
const EXCLUDE_PATHS = new Set([
    'docs/PORTING_GUIDE.md',
    'docs/examples',
].map((p) => path.normalize(p)))

// Path UI-only yang dibuang HANYA pada varian api-only.
//  - public/ (80MB aset), layout web, globalFunctions, modul components (murni UI),
//  - tes UI/e2e/bdd.
// Per-modul UI (routes/web.ts, controllers/web, views/be|fe) ditangani di
// isUiOnlyPath() karena polanya berlapis di tiap modul.
//
// CATATAN (diff full↔api PURELY ADDITIVE): file shared TIDAK dibuang/diedit.
//  - src/index.ts    = entry tunggal (cabang via APP_MODE) → disalin apa adanya,
//                      varian api cukup di-set APP_MODE=api di .env.example.
//  - src/config/feTemplates.ts = self-contained, dipakai SettingValidator →
//                      DIPERTAHANKAN agar validator identik (tak perlu strip).
//  - container.ts / SettingService.ts = guard runtime (lihat src/) → identik.
// Hasilnya: build api hanya mengecualikan file/dir UI utuh, nol edit konten →
// upgrade `nodeadmin add-ui` cukup copy file yang absent, bebas-konflik.
const EXCLUDE_PATHS_API = new Set([
    'public',
    'src/resources/layouts',
    'src/globalFunctions.ts',
    'src/modules/components',
    'src/modules/media',     // file manager rich text editor = fitur UI (web), tak relevan API-only
    'src/modules/home',      // home/template switcher = fitur UI (web)
    'playwright.config.ts',
    'cucumber.cjs',
    'src/config/themes.ts', // (tak ada di src; defensif)
    'docs/screenshots',     // screenshot UI tak relevan untuk API-only
].map((p) => path.normalize(p)))

// Test yang menguji UI/web (login web, CSRF, render halaman, redirect, modul
// components) — dibuang di varian api. File campur web+api ikut dibuang;
// test API murni (loginApi/Bearer) di dashboard/profile/setting.api dipertahankan.
const WEB_TEST_PATHS = new Set([
    'tests/security',
    'tests/smoke',
    'tests/api/setting.test.ts',
    'tests/api/components.test.ts',
    'tests/api/access.user.test.ts',
    'tests/api/auth.test.ts',
    // Test fitur UI yang modulnya dibuang di api (media, home).
    'tests/api/media.test.ts',
    'tests/integration/mediaService.test.ts',
    'tests/api/home.test.ts',
    'tests/integration/feTemplateService.test.ts',
    'tests/integration/feCatalogService.test.ts', // import modules/home → dibuang di api
].map((p) => path.normalize(p)))

// Pola UI-only per-modul (relatif ROOT, normalized) untuk varian api.
function isUiOnlyApiPath(rel) {
    const r = rel.replace(/\\/g, '/')
    // routes/web.ts di modul mana pun
    if (/^src\/modules\/[^/]+\/routes\/web\.ts$/.test(r)) return true
    // controllers web
    if (/^src\/modules\/[^/]+\/http\/controllers\/web(\/|$)/.test(r)) return true
    // views backend & frontend (TAPI simpan views/mail untuk email reset-password)
    if (/^src\/modules\/[^/]+\/views\/(be|fe)(\/|$)/.test(r)) return true
    // tests UI (e2e/bdd)
    if (/^tests\/(e2e|bdd)(\/|$)/.test(r)) return true
    // test web/campur (lihat WEB_TEST_PATHS)
    for (const w of WEB_TEST_PATHS) {
        if (r === w.replace(/\\/g, '/') || r.startsWith(w.replace(/\\/g, '/') + '/')) return true
    }
    return false
}

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }) }

// variant: 'full' | 'api'
function copyRecursive(src, dst, variant) {
    const rel = path.normalize(path.relative(ROOT, src))
    if (EXCLUDE_PATHS.has(rel)) return
    if (variant === 'api') {
        if (EXCLUDE_PATHS_API.has(rel)) return
        if (isUiOnlyApiPath(rel)) return
    }
    const st = fs.statSync(src)
    if (st.isDirectory()) {
        if (EXCLUDE.has(path.basename(src))) return
        fs.mkdirSync(dst, { recursive: true })
        for (const name of fs.readdirSync(src)) {
            if (EXCLUDE.has(name)) continue
            copyRecursive(path.join(src, name), path.join(dst, name), variant)
        }
    } else {
        fs.mkdirSync(path.dirname(dst), { recursive: true })
        fs.copyFileSync(src, dst)
    }
}

// Deps yang HANYA dipakai UI web → dibuang pada varian api.
// (ejs TETAP — dipakai render email reset-password. express-session/method-override
//  dibuang karena api stateless JWT; layouts UI-only. Flash kini inline di core,
//  tak ada lagi dependency connect-flash.)
const UI_ONLY_DEPS = [
    'express-ejs-layouts',
    'method-override',
    // CATATAN: express-session & connect-redis TETAP — redisClient.ts (shared,
    // dipakai blacklist token JWT) meng-import keduanya di module-level. Membuangnya
    // memecah import. Ukurannya kecil; biarkan agar api entry tetap kompilasi.
]

function buildPackageJson(variant) {
    const root = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    const isApi = variant === 'api'

    // Scripts: buang yang bergantung workspace core.
    const s = { ...root.scripts }
    delete s['build:core']
    delete s['pretest']
    // Script khusus pabrik (monorepo) — tak relevan di app turunan.
    delete s['build:template']
    delete s['build:create-app-readme']
    s.build = 'rimraf dist && tsc && nodeadmin copy-views'
    s.start = 'npm run build && pm2 start dist/index.js --watch'
    if (isApi) {
        // Varian api: tak ada e2e/bdd (UI). copy-views tetap (mail templates).
        delete s['test:e2e']
        delete s['test:bdd']
    }

    // dependencies: tambah core + better-sqlite3 (default DB).
    const deps = { ...root.dependencies }
    deps['@flazhost-nodeadmin/core'] = CORE_RANGE
    deps['better-sqlite3'] = root.devDependencies['better-sqlite3'] || '^9.6.0'

    // devDependencies: tambah cli, buang changesets & better-sqlite3 (sudah dipindah).
    const dev = { ...root.devDependencies }
    delete dev['@changesets/cli']
    delete dev['better-sqlite3']
    dev['@flazhost-nodeadmin/cli'] = CLI_RANGE

    if (isApi) {
        // Buang deps UI-only dari runtime + @types pasangannya dari dev.
        for (const d of UI_ONLY_DEPS) {
            delete deps[d]
            delete dev['@types/' + d]
        }
        // playwright/cucumber (UI test) tak diperlukan.
        delete dev['@playwright/test']
        delete dev['@cucumber/cucumber']
    }

    return {
        name: isApi ? 'nodeadmin-api' : 'nodeadmin-app',
        version: '1.0.0',
        private: true,
        main: 'dist/index.js',
        scripts: s,
        keywords: [],
        author: '',
        license: 'ISC',
        description: isApi
            ? 'REST API berbasis NodeAdmin (@flazhost-nodeadmin/core), tanpa UI.'
            : 'Aplikasi admin panel berbasis NodeAdmin (@flazhost-nodeadmin/core).',
        dependencies: sortKeys(deps),
        devDependencies: sortKeys(dev),
    }
}

function sortKeys(o) {
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]))
}

function buildEnvExample(variant) {
    // Ambil .env.example root sebagai basis, override ke SQLite zero-setup.
    let env = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8')
    env = env.replace(/^DB_TYPE=.*/m, 'DB_TYPE=better-sqlite3')
    env = env.replace(/^DB_DATABASE=.*/m, 'DB_DATABASE=./dev.sqlite')
    env = env.replace(/^DB_SYNCHRONIZE=.*/m, 'DB_SYNCHRONIZE=false')
    // Varian api: aktifkan mode api (entry tunggal index.ts bercabang via env).
    // Upgrade ke UI: jalankan `nodeadmin add-ui` (set APP_MODE=full otomatis).
    if (variant === 'api') {
        env = env.replace(/^APP_MODE=.*/m, 'APP_MODE=api')
    }
    return env
}

function buildVariant(variant, out) {
    console.log(`[build-template:${variant}] membersihkan`, path.relative(ROOT, out))
    rmrf(out)
    fs.mkdirSync(out, { recursive: true })

    for (const entry of COPY) {
        const src = path.join(ROOT, entry)
        if (!fs.existsSync(src)) continue
        copyRecursive(src, path.join(out, entry), variant)
    }

    // Varian api: entry index.ts identik (cabang via APP_MODE — di-set di
    // .env.example). File shared (container/SettingService/SettingValidator)
    // TIDAK diedit — guard runtime + feTemplates self-contained membuatnya
    // identik di kedua varian (diff PURELY ADDITIVE → add-ui bebas-konflik).
    if (variant === 'api') {
        // Test api-only pengganti untuk modul yg test-nya campur web (dibuang):
        // access & auth wajib punya api test (checker konvensi). Tulis stub API.
        const apiTestsDir = path.join(ROOT, 'tools/templates/api-tests')
        if (fs.existsSync(apiTestsDir)) {
            fs.mkdirSync(path.join(out, 'tests/api'), { recursive: true })
            for (const f of fs.readdirSync(apiTestsDir)) {
                fs.copyFileSync(path.join(apiTestsDir, f), path.join(out, 'tests/api', f))
            }
        }
    }

    fs.writeFileSync(
        path.join(out, 'package.json'),
        JSON.stringify(buildPackageJson(variant), null, 2) + '\n',
    )

    fs.writeFileSync(path.join(out, '.env.example'), buildEnvExample(variant))

    fs.writeFileSync(path.join(out, 'README.md'), buildReadme(variant))

    // Template frontend: hanya sertakan DEFAULT (yang di-bundle). Sisanya hasil
    // download on-demand di mesin user — jangan ikut ke template (jaga ramping).
    const feDir = path.join(out, 'public/fe/templates')
    if (fs.existsSync(feDir)) {
        for (const f of fs.readdirSync(feDir)) {
            if (f !== 'agency-consulting-002-creative-agency.html') {
                fs.rmSync(path.join(feDir, f), { force: true })
            }
        }
    }

    console.log(`[build-template:${variant}] selesai →`, path.relative(ROOT, out))
}

function main() {
    buildVariant('full', OUT)
    buildVariant('api', OUT_API)
}

// README app turunan: dari README utama, strip section pabrik. Varian api juga
// buang section UI murni (Template Switcher) + sesuaikan judul.
function buildReadme(variant) {
    if (variant === 'api') {
        // Buang section UI murni: screenshot halaman & template switcher tak relevan
        // untuk REST API. (docs/screenshots juga tak ikut — lihat EXCLUDE api docs.)
        return buildCleanReadme({ dropSections: ['🖼️ Screenshots', '🎨 Template Switcher'] })
    }
    return buildCleanReadme()
}

main()
