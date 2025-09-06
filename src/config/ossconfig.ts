
import * as dotenv from 'dotenv';
import OSS from 'ali-oss';

dotenv.config();

const config = {
    accessKeyId: process.env.OSS_ACCESS_ID as string,
    accessKeySecret: process.env.OSS_ACCESS_KEY as string,
    endpoint: process.env.OSS_ENDPOINT,
    bucket: process.env.OSS_BUCKET,
    secure: process.env.OSS_SSL === 'true'
};

const oss = new OSS(config)

export { config as ossConfig }
export default oss
