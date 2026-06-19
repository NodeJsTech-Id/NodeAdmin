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

const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'template')

// Versi paket factory yang ditargetkan template (caret range).
const CORE_RANGE = '^1.1'
const CLI_RANGE = '^1.1'

// Entri root yang DISALIN apa adanya ke template.
const COPY = [
    'src',
    'public',
    'tests',
    'spec',
    'docs',
    'tsconfig.json',
    'jest.config.js',
    'cucumber.cjs',
    'playwright.config.ts',
    '.env.test',
    '.gitignore',
]

// Yang TIDAK pernah disalin (monorepo-only / artefak / rahasia).
const EXCLUDE = new Set([
    'node_modules', 'dist', 'coverage', 'test-results',
    'packages', '.changeset', '.github', '.git',
    '.env', 'package-lock.json', 'template',
])

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }) }

function copyRecursive(src, dst) {
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

    // README ringkas khusus app hasil scaffold.
    fs.writeFileSync(path.join(OUT, 'README.md'), TEMPLATE_README)
    console.log('  tulis README.md')

    console.log('[build-template] selesai →', path.relative(ROOT, OUT))
}

const TEMPLATE_README = `# NodeAdmin App

Aplikasi admin panel yang di-scaffold dari \`@flazhost-nodeadmin/create-app\`.
Runtime generik berasal dari paket [\`@flazhost-nodeadmin/core\`](https://www.npmjs.com/package/@flazhost-nodeadmin/core).

## Mulai

\`\`\`bash
npm install
cp .env.example .env          # default: SQLite (tanpa server DB)
npm run migration:run         # buat tabel + seed admin & setting
npm run start:dev             # http://localhost:3000
\`\`\`

Login default: \`admin@admin.com\` / \`12345678\` (ganti sebelum production).

## Ganti database

Edit \`.env\` → \`DB_TYPE\` (mysql | mariadb | postgres | better-sqlite3 | mssql | oracle)
dan kredensialnya. Driver mysql2 & pg sudah terpasang.

## Update runtime

\`\`\`bash
npm update @flazhost-nodeadmin/core @flazhost-nodeadmin/cli
\`\`\`
`

main()
