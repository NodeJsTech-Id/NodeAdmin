import { clientRedis } from '..'
import axios from 'axios'
import * as jsrsasign from 'jsrsasign'

export default class ZoomService {
    public async getAccessToken() {
        const key = 'zoomAccessToken'
        const token = await clientRedis.get(key)
        if (token) {
            return JSON.parse(token)
        }

        const secret_buff = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`)
        const secret_encode = secret_buff.toString('base64')
        const post_url = `${process.env.ZOOM_OAUTH_ENDPOINT}?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`
        const response = await axios.post(
            post_url,
            {},
            {
                headers: {
                    Authorization: `Basic ${secret_encode}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        )
        if (response.data) {
            if (response.data.access_token) {
                await clientRedis.setEx(key, response.data.expires_in, JSON.stringify(response.data))
            }
            return response.data
        }
        return null
    }

    public async createMeeting(param: any) {
        const { access_token } = await this.getAccessToken()
        const user = 'development@flazhost.com'
        const dataMeeting = {
            topic: param.topic,
            type: 2,
            start_time: param.start_time,
            duration: param.duration,
            timezone: 'Asia/Jakarta',
            password: '1234567890',
            schedule_for: user,
            settings: {
                host_video: true,
                participant_video: true,
                in_meeting: true,
                join_before_host: true,
                jbh_time: 0,
                mute_upon_entry: true,
                watermark: true,
                user_pmi: false,
                approval_type: 2,
                audio: 'both',
                auto_recording: 'cloud',
            },
        }
        const req = await axios.post(
            `${process.env.ZOOM_API_BASE_URL}/users/${user}/meetings`,
            dataMeeting,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
            },
        )
        if (req) {
            return req.data
        }
        return null
    }

    public generateTokenJoin(param: any) {
        const { KJUR } = jsrsasign
        const iat = Math.round(new Date().getTime() / 1000) - 30
        const exp = iat + 60 * 60 * 3
    
        const oHeader = { alg: 'HS256', typ: 'JWT' }
    
        const oPayload = {
            sdkKey: process.env.ZOOM_MEETING_SDK_KEY,
            mn: param.meeting_number,
            role: param.role,
            iat: iat,
            exp: exp,
            appKey: process.env.ZOOM_MEETING_SDK_KEY,
            tokenExp: iat + 60 * 60 * 2,
        }
    
        const sHeader = JSON.stringify(oHeader)
        const sPayload = JSON.stringify(oPayload)
        const signature = KJUR.jws.JWS.sign(
            'HS256',
            sHeader,
            sPayload,
            process.env.ZOOM_MEETING_SDK_SECRET,
        )
        return signature
    }
}