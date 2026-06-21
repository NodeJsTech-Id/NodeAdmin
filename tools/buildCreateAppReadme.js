#!/usr/bin/env node
/**
 * buildCreateAppReadme.js — generate packages/create-app/README.md (tampil di npm)
 * dari README utama, agar selengkap mungkin (arsitektur, prinsip, security,
 * testing, API) TANPA materi pabrik/porting.
 *
 * Beda dari template README:
 *  - path gambar diubah ke URL absolut GitHub raw (npm tak punya file lokal),
 *  - judul + intro diganti header scaffolder (badge + perintah npm create).
 *
 * Jalankan: npm run build:create-app-readme
 */
const fs = require('fs')
const path = require('path')
const { buildCleanReadme, ROOT } = require('./lib/readme')

const RAW = 'https://raw.githubusercontent.com/FlazHost-Com/NodeAdmin/main/'
const OUT = path.join(ROOT, 'packages/create-app/README.md')

const HEADER = `# create-app — NodeAdmin

[![npm](https://img.shields.io/npm/v/@flazhost-nodeadmin/create-app.svg)](https://www.npmjs.com/package/@flazhost-nodeadmin/create-app)
[![license](https://img.shields.io/npm/l/@flazhost-nodeadmin/create-app.svg)](https://github.com/FlazHost-Com/NodeAdmin/blob/main/LICENSE)

Scaffold a **complete, ready-to-use Node.js admin panel application** in a single command — auth, RBAC, profile, setting, theme + frontend template switcher, migrations + admin seed, everything already wired up.

\`\`\`bash
npm create @flazhost-nodeadmin/app@latest myapp
cd myapp
npm install
cp .env.example .env          # default: SQLite — no DB server
npm run migration:run         # create tables + seed admin & setting
npm run start:dev             # http://localhost:3000
\`\`\`

> Use the **\`@latest\`** suffix so \`npx\` does not use a stale version from cache.

## Choose an application variant

The scaffolder asks for the **application type** (a select menu), or you can set it via a flag without any prompt:

\`\`\`bash
npm create @flazhost-nodeadmin/app@latest myapp              # interactive: choose Full / API only
npm create @flazhost-nodeadmin/app@latest myapp -- --api     # straight to API only (REST, no UI)
\`\`\`

| Variant | Contents | Best for |
|---------|----------|----------|
| **Full (UI + REST API)** *(default)* | Complete admin panel: web pages (EJS+Tailwind), assets, home + frontend template, UI components, plus REST API. | A ready-to-use admin panel. |
| **API only (REST, no UI)** | REST API only — no \`public/\`, views, or UI modules (home/components/media). Lightweight. | Headless backend / SPA / mobile. |

Also works with: \`npm init\`, \`yarn create\`, \`pnpm create\`. With no name argument → you are prompted interactively.
Default login: \`admin@admin.com\` / \`12345678\`.

The scaffolded application is a **standalone** project that pulls its runtime from
[\`@flazhost-nodeadmin/core\`](https://www.npmjs.com/package/@flazhost-nodeadmin/core) +
[\`@flazhost-nodeadmin/cli\`](https://www.npmjs.com/package/@flazhost-nodeadmin/cli) (npm) —
to update, just run \`npm update\`.

---

`

function main() {
    // Body lengkap dari README utama: buang section pabrik, buang judul+intro
    // (diganti HEADER), ubah path gambar ke URL raw GitHub.
    let body = buildCleanReadme({
        dropTitle: true,
        imagePath: (p) => (p.startsWith('http') ? p : RAW + p.replace(/^\.?\//, '')),
    })

    // "Instalasi" di README utama mengasumsikan clone repo; untuk create-app,
    // user sudah scaffold — biarkan (informatif), tapi ganti langkah git clone.
    body = body.replace(
        /git clone[^\n]*\ncd NodeAdmin\nnpm install/m,
        'npm create @flazhost-nodeadmin/app myapp\ncd myapp\nnpm install',
    )

    // Link relatif ke docs/*.md rusak di halaman npm → arahkan ke GitHub repo bersih.
    const BLOB = 'https://github.com/FlazHost-Com/NodeAdmin/blob/main/'
    body = body.replace(/\]\((docs\/[A-Za-z0-9_]+\.md)\)/g, `](${BLOB}$1)`)

    fs.writeFileSync(OUT, HEADER + body)
    console.log('[create-app-readme] ditulis →', path.relative(ROOT, OUT),
        `(${(HEADER + body).length} char)`)
}

main()
