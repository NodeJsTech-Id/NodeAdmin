
import * as dotenv from 'dotenv'
import OSS from 'ali-oss'

dotenv.config()

const config = {
    // Obtain access credentials from environment variables. Before you run the sample code, make sure that the OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET environment variables are configured. 
    accessKeyId: process.env.OSS_ACCESS_ID as string,
    accessKeySecret: process.env.OSS_ACCESS_KEY as string,
    // Specify the region in which the bucket is located. For example, if the bucket is located in the China (Hangzhou) region, set the region to oss-cn-hangzhou. 
    // region: process.env.OSS_REGION,
    endpoint: process.env.OSS_ENDPOINT,
    // Specify the name of the bucket. 
    bucket: process.env.OSS_BUCKET,
    secure: process.env.OSS_SSL as unknown as boolean
}

const oss = new OSS(config)

export { config as ossConfig }
export default oss
