#!/usr/bin/env node
/**
 * @flazhost-nodeadmin/create-app
 *
 * Scaffolder: `npm create @flazhost-nodeadmin/app myapp`
 * Menarik template aplikasi NodeAdmin standalone dari GitHub (folder template/
 * pada tag tertentu) via giget, lalu menyiapkan project siap jalan.
 */
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')
const pc = require('picocolors')
const { downloadTemplate } = require('giget')

// Sumber template di GitHub. Di-pin ke tag agar versi CLI ↔ template deterministik.
// Format giget: github:<owner>/<repo>/<subdir>#<ref>
const TEMPLATE_TAG = 'template-v1.0.1'
const TEMPLATE_SRC = `github:NodeJsTech-Id/NodeAdmin/template#${TEMPLATE_TAG}`

async function main() {
    const argDir = process.argv.slice(2).find((a) => !a.startsWith('-'))

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

    const targetDir = path.resolve(process.cwd(), targetName)

    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
        console.error(pc.red(`✖ Folder "${targetName}" sudah ada dan tidak kosong.`))
        process.exit(1)
    }

    console.log(pc.cyan(`\n⏬ Mengunduh template NodeAdmin ke ${pc.bold(targetName)}/ ...`))
    try {
        await downloadTemplate(TEMPLATE_SRC, { dir: targetDir, force: true })
    } catch (err) {
        console.error(pc.red('✖ Gagal mengunduh template:'), err.message)
        console.error(pc.dim(`  Sumber: ${TEMPLATE_SRC}`))
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

    printNextSteps(targetName)
}

function sanitizeName(name) {
    return String(name).trim().toLowerCase()
        .replace(/[^a-z0-9-~._]/g, '-')
        .replace(/^-+|-+$/g, '') || 'nodeadmin-app'
}

function printNextSteps(name) {
    console.log(pc.green('\n✔ Selesai! Aplikasi NodeAdmin siap.\n'))
    console.log('Langkah berikutnya:\n')
    console.log(pc.cyan(`  cd ${name}`))
    console.log(pc.cyan('  npm install'))
    console.log(pc.cyan('  cp .env.example .env') + pc.dim('     # default: SQLite (tanpa server DB)'))
    console.log(pc.cyan('  npm run migration:run') + pc.dim('    # buat tabel + seed admin & setting'))
    console.log(pc.cyan('  npm run start:dev') + pc.dim('        # http://localhost:3000'))
    console.log('\nLogin default: ' + pc.bold('admin@admin.com') + ' / ' + pc.bold('12345678'))
    console.log(pc.dim('(ganti password admin sebelum production)\n'))
}

main().catch((err) => {
    console.error(pc.red('✖ Error:'), err)
    process.exit(1)
})
