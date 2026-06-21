#!/usr/bin/env node
/**
 * @flazhost-nodeadmin/create-app
 *
 * Scaffolder: `npm create @flazhost-nodeadmin/app myapp`
 * Menarik template aplikasi NodeAdmin standalone dari GitHub via giget.
 *
 * Varian:
 *   - default → app penuh (UI + REST API)        subdir `template`
 *   - --api   → REST API saja (tanpa UI)         subdir `template-api`
 * Tanpa flag & interaktif → ditanya lewat prompt select.
 */
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')
const pc = require('picocolors')
// giget ≥3 = ESM-only → muat via dynamic import() (file ini CommonJS).
// Dipakai di main() yang sudah async. Versi 3.x melepas dependency `tar` yang
// rentan (node-tar path-traversal) → menghapus audit high di app turunan.

// Tag tunggal mencakup kedua subdir (template + template-api).
const TEMPLATE_TAG = 'template-v1.0.11'
const REPO = 'FlazHost-Com/NodeAdmin'

async function main() {
    const args = process.argv.slice(2)
    const argDir = args.find((a) => !a.startsWith('-'))
    // Flag varian: --api atau --template api
    let variant = (args.includes('--api') || args.includes('--template=api')) ? 'api' : null
    const tIdx = args.indexOf('--template')
    if (tIdx !== -1 && args[tIdx + 1] === 'api') variant = 'api'

    let targetName = argDir
    if (!targetName) {
        const res = await prompts({
            type: 'text',
            name: 'name',
            message: 'Nama project',
            initial: 'nodeadmin-app',
        })
        targetName = res.name
    }
    if (!targetName) {
        console.error(pc.red('✖ Nama project wajib diisi.'))
        process.exit(1)
    }

    // Bila varian belum ditentukan via flag → tanya (interaktif).
    if (!variant) {
        const res = await prompts({
            type: 'select',
            name: 'variant',
            message: 'Jenis aplikasi',
            choices: [
                { title: 'Full (UI + REST API)', value: 'full', description: 'Admin panel lengkap dengan halaman web' },
                { title: 'API only (REST, tanpa UI)', value: 'api', description: 'Hanya REST API — ringan, tanpa views/aset' },
            ],
            initial: 0,
        })
        // Jika user batal (Ctrl+C) → default full.
        variant = res.variant || 'full'
    }

    const subdir = variant === 'api' ? 'template-api' : 'template'
    const src = `github:${REPO}/${subdir}#${TEMPLATE_TAG}`

    const targetDir = path.resolve(process.cwd(), targetName)
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
        console.error(pc.red(`✖ Folder "${targetName}" sudah ada dan tidak kosong.`))
        process.exit(1)
    }

    const label = variant === 'api' ? 'API only' : 'Full (UI + API)'
    console.log(pc.cyan(`\n⏬ Mengunduh template NodeAdmin [${label}] ke ${pc.bold(targetName)}/ ...`))
    try {
        const { downloadTemplate } = await import('giget')
        await downloadTemplate(src, { dir: targetDir, force: true })
    } catch (err) {
        console.error(pc.red('✖ Gagal mengunduh template:'), err.message)
        console.error(pc.dim(`  Sumber: ${src}`))
        process.exit(1)
    }

    // Set nama package sesuai folder user.
    const pkgPath = path.join(targetDir, 'package.json')
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
        pkg.name = sanitizeName(targetName)
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    } catch {
        // non-fatal — template tetap berfungsi tanpa rename.
    }

    printNextSteps(targetName, variant)
}

function sanitizeName(name) {
    return String(name).trim().toLowerCase()
        .replace(/[^a-z0-9-~._]/g, '-')
        .replace(/^-+|-+$/g, '') || 'nodeadmin-app'
}

function printNextSteps(name, variant) {
    const isApi = variant === 'api'
    console.log(pc.green(`\n✔ Selesai! ${isApi ? 'REST API NodeAdmin' : 'Aplikasi NodeAdmin'} siap.\n`))
    console.log('Langkah berikutnya:\n')
    console.log(pc.cyan(`  cd ${name}`))
    console.log(pc.cyan('  npm install'))
    console.log(pc.cyan('  cp .env.example .env') + pc.dim('     # default: SQLite (tanpa server DB)'))
    console.log(pc.cyan('  npm run migration:run') + pc.dim('    # buat tabel + seed admin & setting'))
    console.log(pc.cyan('  npm run start:dev') + pc.dim('        # http://localhost:3000'))
    if (isApi) {
        console.log('\nUji API: ' + pc.bold('POST /api/v1/auth/login') + pc.dim('  { "email": "admin@admin.com", "password": "12345678" }'))
        console.log(pc.dim('→ dapatkan access_token, lalu pakai header Authorization: Bearer <token>'))
    } else {
        console.log('\nLogin default: ' + pc.bold('admin@admin.com') + ' / ' + pc.bold('12345678'))
    }
    console.log(pc.dim('(ganti password admin sebelum production)\n'))
}

main().catch((err) => {
    console.error(pc.red('✖ Error:'), err)
    process.exit(1)
})
