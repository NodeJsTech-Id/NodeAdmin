import request from 'supertest'
import { app } from '../../src/index'
import { resetDb } from '../setup/jest.setup'

describe('Landing (frontend publik)', () => {
    beforeEach(async () => { await resetDb() })

    it('GET / → redirect ke /landing', async () => {
        const res = await request(app).get('/')
        expect(res.status).toBe(302)
        expect(res.headers.location).toBe('/landing')
    })

    it('GET /landing → 200 HTML (default render via EJS)', async () => {
        const res = await request(app).get('/landing')
        expect(res.status).toBe(200)
        expect(res.headers['content-type']).toMatch(/html/)
        expect(res.text.toLowerCase()).toContain('</html>')
    })
})
