import OSS from 'ali-oss';
import env from './env';

const config = {
    accessKeyId: env.oss.accessId,
    accessKeySecret: env.oss.accessKey,
    endpoint: env.oss.endpoint,
    bucket: env.oss.bucket,
    secure: env.oss.secure
};

// Lazy init: jangan buat client saat import (gagal bila kredensial OSS kosong,
// mis. environment dev tanpa OSS). Client baru dibuat saat pertama dipakai.
let _oss: OSS | null = null
function getOss(): OSS {
    if (!_oss) {
        if (!config.accessKeyId || !config.accessKeySecret) {
            throw new Error('OSS belum dikonfigurasi (OSS_ACCESS_ID/OSS_ACCESS_KEY kosong)')
        }
        _oss = new OSS(config)
    }
    return _oss
}

// Proxy agar pemakai tetap memanggil oss.put/oss.delete/dll tanpa perubahan,
// tetapi konstruksi nyata ditunda sampai method dipanggil.
const oss = new Proxy({} as OSS, {
    get(_t, prop) {
        const client = getOss() as any
        const val = client[prop]
        return typeof val === 'function' ? val.bind(client) : val
    },
})

export { config as ossConfig }
export default oss
