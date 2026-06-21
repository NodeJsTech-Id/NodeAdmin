import request from 'supertest'
import { app } from '../../src/index'
import { resetDb } from '../setup/jest.setup'
import { loginApi } from '../setup/helpers'

beforeEach(async () => { await resetDb() })

describe('Access User (API)', () => {
    it('list user → 200 (Bearer)', async () => {
        const token = await loginApi()
        const res = await request(app).get('/api/v1/access/user')
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(200)
        expect(res.body.status).toBe(true)
    })

    it('tanpa token → 401', async () => {
        const res = await request(app).get('/api/v1/access/user')
        expect(res.status).toBe(401)
    })
})
