import oss from '../config/ossconfig'

class FileService {
    async uploadFile(fileName: string, fileContent: Buffer): Promise<any> {
        try {
            const result = await oss.put(fileName, fileContent)
            return result
        } catch (e) {
            return e
        }
    }

    getFile(fileName: string): any {
        let url = oss.signatureUrl(fileName, {
            expires: 3600,
        })
        return url
    }

    async deleteFile(fileName: string): Promise<any> {
        try {
            const result = await oss.delete(fileName)
            return result
        } catch (e) {
            return e
        }
    }
}

export default new FileService()
