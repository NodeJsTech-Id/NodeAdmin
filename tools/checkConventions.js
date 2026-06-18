#!/usr/bin/env node
/**
 * Convention checker — menjaga modul baru sejalan dengan pola & prinsip yang
 * sudah ditetapkan (SOLID/DI, error handling, DRY, portabilitas DB, security).
 *
 * Dijalankan: `npm run lint:conventions` (lokal) dan di CI.
 * Exit 1 bila ada pelanggaran (gate). Berbasis regex/heuristik (cepat, tanpa AST).
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')

const violations = []
const warnings = []
function violate(file, line, msg) { violations.push({ file: rel(file), line, msg }) }
function warn(file, msg) { warnings.push({ file: rel(file), msg }) }
function rel(f) { return path.relative(ROOT, f) }

function walk(dir, cb) {
    if (!fs.existsSync(dir)) return
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) {
            if (['node_modules', 'dist', '.git', 'migrations'].includes(e.name)) continue
            walk(p, cb)
        } else if (e.isFile() && e.name.endsWith('.ts')) {
            cb(p)
        }
    }
}

function lineOf(content, idx) { return content.slice(0, idx).split('\n').length }

function eachMatch(content, regex, cb) {
    let m
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
    while ((m = re.exec(content)) !== null) cb(m, lineOf(content, m.index))
}

// ---- Aturan ----

walk(SRC, (file) => {
    const content = fs.readFileSync(file, 'utf8')
    const f = rel(file)
    const inModules = f.includes('src/modules/')
    const isRoute = /\/routes\/.*\.ts$/.test(f)
    const isService = /\/services\/v1\/\w+Service\.ts$/.test(f) && !/\/I\w+Service\.ts$/.test(f)
    const isController = /\/controllers\/.*Controller\.ts$/.test(f)
    const isEntity = /\.entity\.ts$/.test(f)

    // 1. Larangan anti-pattern error handling (seluruh src kecuali definisi AppError & errorHandler)
    if (!f.endsWith('errors/AppError.ts') && !f.endsWith('middleware/errorHandler.ts')) {
        eachMatch(content, /\binstanceof Error\b/, (_m, ln) =>
            violate(file, ln, 'Dilarang `instanceof Error` — service harus `throw AppError`, controller tak menangani error manual (errorHandler menangani).'))
        eachMatch(content, /^\s*return error\b/m, (_m, ln) =>
            violate(file, ln, 'Dilarang `return error` — gunakan `throw new AppError/NotFoundError/...`.'))
    }

    // 2. Route: tak boleh `new XController()` / `new XService()` — pakai handler(DI)
    if (isRoute) {
        eachMatch(content, /new\s+\w+Controller\s*\(/, (_m, ln) =>
            violate(file, ln, 'Route tak boleh `new XController()` — pakai `handler(XController, "method")` (DI lazy resolve).'))
        eachMatch(content, /new\s+\w+Service\s*\(/, (_m, ln) =>
            violate(file, ln, 'Route tak boleh `new XService()` — service di-inject lewat container.'))
    }

    // 3. Service: wajib @injectable + implements I*Service + ada file interface
    if (isService) {
        if (!/@injectable\(\)/.test(content))
            violate(file, 1, 'Service wajib `@injectable()` (DI).')
        const base = path.basename(file, '.ts')          // mis. UserService
        if (!new RegExp(`implements\\s+I${base}\\b`).test(content))
            violate(file, 1, `Service wajib \`implements I${base}\`.`)
        const ifacePath = path.join(path.dirname(file), `I${base}.ts`)
        if (!fs.existsSync(ifacePath))
            violate(file, 1, `Interface I${base}.ts wajib ada di folder yang sama (Interface Segregation).`)
    }

    // 4. Controller web: dilarang res.render(path.resolve(...) — pakai renderView
    if (isController) {
        eachMatch(content, /res\.render\(\s*path\.resolve/, (_m, ln) =>
            violate(file, ln, 'Gunakan helper `renderView(res, Module.path, view, locals)` — bukan res.render(path.resolve...).'))
    }

    // 5. Entity: tipe kolom portabel (hindari vendor-spesifik + timestamp eksplisit)
    if (isEntity) {
        eachMatch(content, /type:\s*['"](longtext|mediumtext|tinytext|datetime)['"]/, (m, ln) =>
            violate(file, ln, `Tipe kolom '${m[1]}' tidak portabel — pakai 'text'/'varchar'/'timestamp' abstrak.`))
        eachMatch(content, /@(Create|Update)DateColumn\(\{\s*type:/, (_m, ln) =>
            violate(file, ln, 'Jangan set `type` di @Create/UpdateDateColumn — biarkan TypeORM memilih per dialek (portabilitas SQLite/PG/MySQL).'))
    }

    // 6. Modul tak boleh akses process.env langsung — lewat config/env
    if (inModules) {
        eachMatch(content, /process\.env\./, (_m, ln) =>
            violate(file, ln, 'Jangan akses `process.env` di modul — gunakan `env` dari src/config/env.ts.'))
    }
})

// 7. Tiap modul punya minimal 1 test terkait (heuristik) — warning, bukan blok
const modulesDir = path.join(SRC, 'modules')
const testsDir = path.join(ROOT, 'tests')
if (fs.existsSync(modulesDir) && fs.existsSync(testsDir)) {
    const allTests = []
    walk(testsDir, (p) => allTests.push(rel(p).toLowerCase()))
    for (const mod of fs.readdirSync(modulesDir, { withFileTypes: true })) {
        if (!mod.isDirectory()) continue
        const name = mod.name.toLowerCase()
        // modul tanpa service (mis. dashboard) dikecualikan
        const hasService = fs.existsSync(path.join(modulesDir, mod.name, 'http', 'services'))
        if (!hasService) continue
        const covered = allTests.some(t => t.includes(name))
        if (!covered) warn(path.join(modulesDir, mod.name), `Modul '${mod.name}' belum punya file test terkait di tests/.`)
    }
}

// ---- Laporan ----
if (warnings.length) {
    console.log('\n⚠️  Warnings:')
    for (const w of warnings) console.log(`  - ${w.file}: ${w.msg}`)
}

if (violations.length) {
    console.error('\n❌ Pelanggaran konvensi (' + violations.length + '):\n')
    for (const v of violations) console.error(`  ${v.file}:${v.line}\n     → ${v.msg}`)
    console.error('\nPerbaiki sesuai AGENTS.md / docs/MODULE_GUIDE.md sebelum melanjutkan.\n')
    process.exit(1)
}

console.log('\n✅ Konvensi terpenuhi — modul sejalan dengan pola yang ditetapkan.')
process.exit(0)
