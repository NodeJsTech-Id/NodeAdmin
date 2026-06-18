import OSS from 'ali-oss';
import env from './env';

const config = {
    accessKeyId: env.oss.accessId,
    accessKeySecret: env.oss.accessKey,
    endpoint: env.oss.endpoint,
    bucket: env.oss.bucket,
    secure: env.oss.secure
};

const oss = new OSS(config)

export { config as ossConfig }
export default oss
