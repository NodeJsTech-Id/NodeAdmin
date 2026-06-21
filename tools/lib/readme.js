// Shared: hasilkan README "bersih" dari README utama repo, buang section
// pabrik/monorepo/porting. Dipakai buildTemplate.js (app turunan) &
// buildCreateAppReadme.js (halaman npm create-app).
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..', '..')

// Heading `## ...` yang dibuang (materi pabrik/monorepo, tak relevan utk konsumen).
const DROP_SECTIONS = [
    '⚡ Buat Aplikasi Baru (Scaffold)',
    '📦 Paket Pabrik',
]

/**
 * @param {object} opts
 * @param {(p:string)=>string} [opts.imagePath] transform path gambar (mis. → URL raw GitHub).
 * @param {boolean} [opts.dropTitle] buang judul H1 + intro asli (utk diganti header sendiri).
 * @param {string[]} [opts.dropSections] heading H2 tambahan yang dibuang (mis. varian api).
 * @returns {string}
 */
function buildCleanReadme(opts = {}) {
    const src = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8')
    const lines = src.split('\n')
    const drop = [...DROP_SECTIONS, ...(opts.dropSections || [])]
    const out = []
    let skipping = false

    for (const line of lines) {
        const h2 = line.match(/^##\s+(.*)$/)
        if (h2) {
            skipping = drop.some((t) => h2[1].trim() === t)
            if (skipping) {
                while (out.length && out[out.length - 1].trim() === '') out.pop()
                if (out.length && out[out.length - 1].trim() === '---') out.pop()
                while (out.length && out[out.length - 1].trim() === '') out.pop()
                continue
            }
        }
        if (!skipping) out.push(line)
    }

    let text = out.join('\n')
    text = text.replace(/^Runtime generik & tooling diekstrak[^\n]*\n/m, '')
    text = text.replace(/\n# Paket pabrik \(packages\/\*\)[\s\S]*?changeset publish[^\n]*\n/m, '\n')
    text = text.replace(/^packages\/.*\n(?:[├└│].*\n)*\n?/m, '')
    text = text.replace(/^\.changeset\/.*\n/m, '')
    text = text.replace(/^(src\/\s+#).*$/m, '$1 kode aplikasi')

    // Transform path gambar bila diminta (mis. relatif → URL absolut).
    if (opts.imagePath) {
        text = text.replace(/(!\[[^\]]*\]\()([^)]+)(\))/g, (m, a, p, b) =>
            a + opts.imagePath(p) + b)
    }

    // Buang judul H1 + paragraf intro pertama (utk diganti header kustom).
    if (opts.dropTitle) {
        text = text.replace(/^#\s+[^\n]*\n+/, '')                 // H1
        text = text.replace(/^[^\n#].*?\n\n(?=---|\n*##)/s, '')   // paragraf intro s/d pemisah
        text = text.replace(/^---\n+/, '')                        // pemisah sisa di awal
    }

    text = text.replace(/\n{3,}/g, '\n\n')
    return text.trimStart()
}

module.exports = { buildCleanReadme, ROOT }
