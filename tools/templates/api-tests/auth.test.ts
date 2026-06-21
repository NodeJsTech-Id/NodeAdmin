import request from 'supertest'
import { app } from '../../src/index'
import { resetDb, ADMIN } from '../setup/jest.setup'

beforeEach(async () => { await resetDb() })

describe('Auth (API)', () => {
    it('API login mengembalikan JWT', async () => {
        const res = await request(app).post('/api/v1/auth/login')
            .send({ email: ADMIN.email, password: ADMIN.password })
        expect(res.status).toBe(200)
        expect(res.body.data.access_token).toBeTruthy()
    })

    it('API login salah → 401', async () => {
        const res = await request(app).post('/api/v1/auth/login')
            .send({ email: ADMIN.email, password: 'salah' })
        expect(res.status).toBe(401)
    })
})
