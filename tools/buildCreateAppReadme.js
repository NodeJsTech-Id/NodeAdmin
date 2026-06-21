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

Scaffold **aplikasi admin panel Node.js yang utuh & siap pakai** dalam satu perintah — auth, RBAC, profile, setting, theme + frontend template switcher, migrasi + seed admin, semuanya sudah tertata.

\`\`\`bash
npm create @flazhost-nodeadmin/app@latest myapp
cd myapp
npm install
cp .env.example .env          # default: SQLite — tanpa server DB
npm run migration:run         # buat tabel + seed admin & setting
npm run start:dev             # http://localhost:3000
\`\`\`

> Pakai akhiran **\`@latest\`** agar \`npx\` tidak memakai versi lama dari cache.

## Pilih varian aplikasi

Scaffolder menanyakan **jenis aplikasi** (menu pilih), atau tentukan via flag tanpa prompt:

\`\`\`bash
npm create @flazhost-nodeadmin/app@latest myapp              # interaktif: pilih Full / API only
npm create @flazhost-nodeadmin/app@latest myapp -- --api     # langsung API only (REST, tanpa UI)
\`\`\`

| Varian | Isi | Cocok untuk |
|--------|-----|-------------|
| **Full (UI + REST API)** *(default)* | Admin panel lengkap: halaman web (EJS+Tailwind), aset, landing + frontend template, komponen UI, plus REST API. | Admin panel siap pakai. |
| **API only (REST, tanpa UI)** | Hanya REST API — tanpa \`public/\`, views, modul UI (landing/components/media). Ringan. | Backend headless / SPA / mobile. |

Juga: \`npm init\`, \`yarn create\`, \`pnpm create\`. Tanpa argumen nama → ditanya interaktif.
Login default: \`admin@admin.com\` / \`12345678\`.

Aplikasi hasil scaffold adalah project **standalone** yang menarik runtime dari
[\`@flazhost-nodeadmin/core\`](https://www.npmjs.com/package/@flazhost-nodeadmin/core) +
[\`@flazhost-nodeadmin/cli\`](https://www.npmjs.com/package/@flazhost-nodeadmin/cli) (npm) —
update cukup \`npm update\`.

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
