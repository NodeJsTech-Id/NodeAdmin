import 'reflect-metadata'
import FeCatalogService from '../../src/modules/landing/http/services/v1/FeCatalogService'
import { deriveFeTemplate } from '../../src/config/feTemplates'

// Stub fetch agar test deterministik (tak menyentuh GitHub).
const TREE = {
    tree: [
        { type: 'blob', path: 'landings/agency-consulting-001-digital-marketing-agency.html' },
        { type: 'blob', path: 'landings/agency-consulting-002-creative-agency.html' },
        { type: 'blob', path: 'landings/technology-saas-001-hero-focused-conversion-page.html' },
        { type: 'blob', path: 'landings/README.md' }, // bukan landing → diabaikan
        { type: 'tree', path: 'landings' },           // bukan blob → diabaikan
    ],
}

describe('deriveFeTemplate (unit)', () => {
    it('parse slug {kategori}-{NNN}-{nama} → name & category title-case', () => {
        const t = deriveFeTemplate('agency-consulting-001-digital-marketing-agency')
        expect(t.category).toBe('Agency Consulting')
        expect(t.name).toBe('Digital Marketing Agency')
    })
    it('slug tak sesuai pola → category Other', () => {
        const t = deriveFeTemplate('randomslug')
        expect(t.category).toBe('Other')
    })
})

describe('FeCatalogService (integration, fetch di-stub)', () => {
    let service: FeCatalogService
    const realFetch = global.fetch

    beforeEach(() => {
        service = new FeCatalogService()
        // Hindari baca cache disk lama → paksa jalur fetch.
        ;(service as any).readDiskCache = () => null
        ;(service as any).writeDiskCache = () => {}
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => TREE,
        })) as any
    })
    afterEach(() => { global.fetch = realFetch })

    it('list() → hanya blob landings .html yang diparse (3 item)', async () => {
        const all = await service.list()
        expect(all).toHaveLength(3)
        expect(all.every((t) => !!t.slug && !!t.name && !!t.category)).toBe(true)
    })

    it('list() di-cache memori → fetch hanya sekali', async () => {
        await service.list()
        await service.list()
        expect((global.fetch as jest.Mock).mock.calls).toHaveLength(1)
    })

    it('categories() → unik & terurut', async () => {
        const cats = await service.categories()
        expect(cats).toEqual(['Agency Consulting', 'Technology Saas'])
    })

    it('paginate() → slice sesuai page_size', async () => {
        const res = await service.paginate({ q_page: 1, q_page_size: 2 })
        expect(res.datas).toHaveLength(2)
        expect(res.paginate_data.total_data).toBe(3)
        expect(res.paginate_data.total_page).toBe(2)
    })

    it('paginate() filter q_name (case-insensitive)', async () => {
        const res = await service.paginate({ q_name: 'creative' })
        expect(res.datas).toHaveLength(1)
        expect(res.datas[0].slug).toContain('creative-agency')
    })

    it('paginate() filter q_category', async () => {
        const res = await service.paginate({ q_category: 'Technology Saas' })
        expect(res.datas).toHaveLength(1)
        expect(res.datas[0].category).toBe('Technology Saas')
    })

    it('has() true untuk slug dalam katalog, false untuk asing', async () => {
        expect(await service.has('agency-consulting-002-creative-agency')).toBe(true)
        expect(await service.has('slug-tak-ada')).toBe(false)
    })

    it('previewHtml() slug asing → AppError 400', async () => {
        await expect(service.previewHtml('slug-tak-ada')).rejects.toMatchObject({ statusCode: 400 })
    })

    it('list() fallback ke katalog kurasi saat fetch gagal', async () => {
        global.fetch = jest.fn(async () => ({ ok: false, status: 500 })) as any
        const all = await service.list()
        expect(all.length).toBeGreaterThan(0) // FE_TEMPLATES fallback
    })
})
