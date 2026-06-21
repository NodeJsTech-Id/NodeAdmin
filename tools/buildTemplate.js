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

// Versi paket factory yang ditargetkan template (caret range).
const CORE_RANGE = '^1.1'
const CLI_RANGE = '^1.1'

// Entri root yang DISALIN apa adanya ke template.
// CATATAN: `spec/` & materi porting TIDAK disalin — itu materi "pabrik" untuk
// mem-porting NodeAdmin ke bahasa lain, tak relevan untuk app turunan Node.
const COPY = [
    'src',
    'public',
    'tests',
    'docs',
    'tsconfig.json',
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

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }) }

function copyRecursive(src, dst) {
    const rel = path.relative(ROOT, src)
    if (EXCLUDE_PATHS.has(path.normalize(rel))) return
    const st = fs.statSync(src)
    if (st.isDirectory()) {
        if (EXCLUDE.has(path.basename(src))) return
        fs.mkdirSync(dst, { recursive: true })
        for (const name of fs.readdirSync(src)) {
            if (EXCLUDE.has(name)) continue
            copyRecursive(path.join(src, name), path.join(dst, name))
        }
    } else {
        fs.mkdirSync(path.dirname(dst), { recursive: true })
        fs.copyFileSync(src, dst)
    }
}

function buildPackageJson() {
    const root = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

    // Scripts: buang yang bergantung workspace core.
    const s = { ...root.scripts }
    delete s['build:core']
    delete s['pretest']
    // Script khusus pabrik (monorepo) — tak relevan di app turunan.
    delete s['build:template']
    delete s['build:create-app-readme']
    s.build = 'rimraf dist && tsc && nodeadmin copy-views'
    s.start = 'npm run build && pm2 start dist/index.js --watch'

    // dependencies: tambah core + better-sqlite3 (default DB), buang driver berat
    // tetap (mysql2/pg tetap ada agar ganti DB mudah). better-sqlite3 dipindah
    // dari devDependencies → dependencies karena jadi default runtime.
    const deps = { ...root.dependencies }
    deps['@flazhost-nodeadmin/core'] = CORE_RANGE
    deps['better-sqlite3'] = root.devDependencies['better-sqlite3'] || '^9.6.0'

    // devDependencies: tambah cli, buang changesets (rilis monorepo) & better-sqlite3 (sudah dipindah).
    const dev = { ...root.devDependencies }
    delete dev['@changesets/cli']
    delete dev['better-sqlite3']
    dev['@flazhost-nodeadmin/cli'] = CLI_RANGE

    return {
        name: 'nodeadmin-app',
        version: '1.0.0',
        private: true,
        main: 'dist/index.js',
        scripts: s,
        keywords: [],
        author: '',
        license: 'ISC',
        description: 'Aplikasi admin panel berbasis NodeAdmin (@flazhost-nodeadmin/core).',
        dependencies: sortKeys(deps),
        devDependencies: sortKeys(dev),
    }
}

function sortKeys(o) {
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]))
}

function buildEnvExample() {
    // Ambil .env.example root sebagai basis, override ke SQLite zero-setup.
    let env = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8')
    env = env.replace(/^DB_TYPE=.*/m, 'DB_TYPE=better-sqlite3')
    env = env.replace(/^DB_DATABASE=.*/m, 'DB_DATABASE=./dev.sqlite')
    env = env.replace(/^DB_SYNCHRONIZE=.*/m, 'DB_SYNCHRONIZE=false')
    return env
}

function main() {
    console.log('[build-template] membersihkan', path.relative(ROOT, OUT))
    rmrf(OUT)
    fs.mkdirSync(OUT, { recursive: true })

    for (const entry of COPY) {
        const src = path.join(ROOT, entry)
        if (!fs.existsSync(src)) { console.warn('  (lewati, tak ada)', entry); continue }
        copyRecursive(src, path.join(OUT, entry))
        console.log('  copy', entry)
    }

    fs.writeFileSync(
        path.join(OUT, 'package.json'),
        JSON.stringify(buildPackageJson(), null, 2) + '\n',
    )
    console.log('  tulis package.json (standalone)')

    fs.writeFileSync(path.join(OUT, '.env.example'), buildEnvExample())
    console.log('  tulis .env.example (SQLite)')

    // README lengkap tapi disesuaikan: dari README utama, buang section "pabrik"
    // (monorepo/rilis/scaffold) yang tak relevan untuk app turunan.
    fs.writeFileSync(path.join(OUT, 'README.md'), buildReadme())
    console.log('  tulis README.md (disesuaikan dari README utama)')

    console.log('[build-template] selesai →', path.relative(ROOT, OUT))
}

// README app turunan: dari README utama, strip section pabrik. Path gambar tetap
// relatif (docs/screenshots/ ikut ter-copy ke template).
function buildReadme() {
    return buildCleanReadme()
}

main()
