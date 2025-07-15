
import * as dotenv from 'dotenv'
import OSS from 'ali-oss'

dotenv.config()

const config = {
    // Obtain access credentials from environment variables. Before you run the sample code, make sure that the KELASCENDIKIA_OSS_ACCESS_KEY_ID and KELASCENDIKIA_OSS_ACCESS_KEY_SECRET environment variables are configured. 
    accessKeyId: process.env.KELASCENDIKIA_OSS_ACCESS_ID as string,
    accessKeySecret: process.env.KELASCENDIKIA_OSS_ACCESS_KEY as string,
    // Specify the region in which the bucket is located. For example, if the bucket is located in the China (Hangzhou) region, set the region to oss-cn-hangzhou. 
    // region: process.env.KELASCENDIKIA_OSS_REGION,
    endpoint: process.env.KELASCENDIKIA_OSS_ENDPOINT,
    // Specify the name of the bucket. 
    bucket: process.env.KELASCENDIKIA_OSS_BUCKET,
    secure: process.env.KELASCENDIKIA_OSS_SSL as unknown as boolean
}

const oss = new OSS(config)

export { config as ossConfig }
export default oss
