#!/usr/bin/env node
/**
 * Entry CLI @nodeadmin/cli — dispatch subcommand ke tool di lib/.
 * Semua tool mengasumsikan cwd = root app turunan (process.cwd()).
 *
 *   nodeadmin check           → convention checker (gate, exit 1 bila langgar)
 *   nodeadmin copy-views      → salin .ejs src → dist saat build
 *   nodeadmin make-migration  → generate file migration TypeORM (interaktif)
 */
const path = require('path')

const cmd = process.argv[2]
const LIB = path.join(__dirname, '..', 'lib')

switch (cmd) {
    case 'check':
        require(path.join(LIB, 'checkConventions.js'))
        break
    case 'copy-views':
        require(path.join(LIB, 'copyViews.js'))
        break
    case 'make-migration':
        require(path.join(LIB, 'generateMigration.js'))
        break
    default:
        console.error(`@nodeadmin/cli — subcommand tidak dikenal: ${cmd || '(kosong)'}`)
        console.error('Tersedia: check | copy-views | make-migration')
        process.exit(1)
}
