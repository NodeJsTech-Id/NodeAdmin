#!/usr/bin/env node
/**
 * buildCleanMirror.js — hasilkan snapshot "bersih" repo (tanpa materi porting
 * bahasa lain) untuk di-mirror ke repo publik rilis (FlazHost-Com/NodeAdmin).
 *
 * Repo maintain (NodeJsTech-Id) memuat semua termasuk materi pabrik untuk
 * porting ke bahasa lain. Repo bersih hanya berisi app Node + paket npm +
 * template, sebagai sumber tunggal giget create-app dan publish npm.
 *
 * Jalankan: node tools/buildCleanMirror.js <output-dir>
 * (workflow mirror memanggil ini, lalu push isi <output-dir> ke repo bersih.)
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '.mirror-out'))

// Materi pabrik / multi-bahasa & artefak lokal yang TAK boleh ikut ke repo bersih.
// Path relatif terhadap ROOT.
const EXCLUDE_PATHS = new Set([
    // Materi porting bahasa lain (root + cermin di template sudah bersih sendiri).
    'docs/PORTING_GUIDE.md',
    'docs/examples',
    'spec',
    // Workflow mirror tinggal di repo maintain saja — repo bersih tak mirror dirinya.
    '.github/workflows/mirror.yml',
    // Artefak lokal / rahasia / generated.
    '.git',
    '.env',
    'node_modules',
    'dist',
    'coverage',
    'test-results',
    '.mirror-out',
].map((p) => path.normalize(p)))

// basename yang selalu di-skip (di kedalaman mana pun).
const EXCLUDE_NAMES = new Set([
    'node_modules', 'dist', 'coverage', 'test-results',
    'settings.local.json', '.env',
])

function copyRecursive(src, dst) {
    const rel = path.normalize(path.relative(ROOT, src))
    if (EXCLUDE_PATHS.has(rel)) return
    if (EXCLUDE_NAMES.has(path.basename(src))) return

    const st = fs.statSync(src)
    if (st.isDirectory()) {
        fs.mkdirSync(dst, { recursive: true })
        for (const name of fs.readdirSync(src)) {
            copyRecursive(path.join(src, name), path.join(dst, name))
        }
    } else {
        fs.mkdirSync(path.dirname(dst), { recursive: true })
        fs.copyFileSync(src, dst)
    }
}

function main() {
    console.log('[mirror] sumber :', ROOT)
    console.log('[mirror] output :', OUT)
    fs.rmSync(OUT, { recursive: true, force: true })
    fs.mkdirSync(OUT, { recursive: true })

    for (const name of fs.readdirSync(ROOT)) {
        if (name === path.basename(OUT)) continue
        copyRecursive(path.join(ROOT, name), path.join(OUT, name))
    }

    // Sanity: pastikan materi porting benar-benar absen.
    const mustAbsent = ['docs/PORTING_GUIDE.md', 'docs/examples', 'spec',
        'template/docs/PORTING_GUIDE.md', 'template/docs/examples', 'template/spec']
    const leaks = mustAbsent.filter((p) => fs.existsSync(path.join(OUT, p)))
    if (leaks.length) {
        console.error('[mirror] GAGAL — materi porting masih ada:', leaks)
        process.exit(1)
    }
    console.log('[mirror] OK — snapshot bersih (porting & spec dikecualikan)')
}

main()
