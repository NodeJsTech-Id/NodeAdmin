import { v6 as uuidv6 } from 'uuid'
import { AppDataSource } from '../../../../../index'
import functions, { removePrefix } from '../../../../../helpers/functions'
import { SubjectFile } from '../../../models/subject_file.entity'
import Module from '../../../Module'
import fileService from '../../../../../services/fileService'

export default class SubjectFileService {
    private subjectFileRepository = AppDataSource.getRepository(SubjectFile)

    public async index(subject_id: string, filter: any) {
        const cleanConditions = removePrefix(filter, 'q_')
		let query = this.subjectFileRepository.createQueryBuilder('subject_files')
		query = query.leftJoinAndSelect('subject_files.subject','subjects')
		// filter
		if (cleanConditions.path) {
			query = query.andWhere(`subject_files.path LIKE :path`, { path: `%${cleanConditions.path}%` })
		}
        query.andWhere(`subject_files.subject_id = :subject_id`, { subject_id: subject_id })
		query = query.addOrderBy(`subject_files.created_at`, "DESC")
		// get data
		const datas = await query.getMany()
        datas.map((data) => {
            data.path = fileService.getFile(data.path, true)
            return data
        })
		return { datas }
    }

    public async store(subject_id: string, request: any, files: any = null) {
        try {
            request.id = uuidv6()
            if (files.length == 0) throw new Error('File required')
            const uploadResults = await Promise.all(
                files.map((file: { fieldname: any, originalname: any, buffer: any }) => {
                    const fileName = request.id
                    const isConvertible = ['jpg', 'jpeg', 'png', 'tiff', 'bmp'].includes(file.originalname.split('.').pop().toLowerCase())
                    let path
                    if (isConvertible) {
                        path = Module.filePath+fileName+".webp"
                    } else {
                        path = Module.filePath+fileName+"."+file.originalname.split('.').pop().toLowerCase()
                    }
                    fileService.uploadFile(path, file.buffer, true)
                    if (file.fieldname == 'file') {
                        request.path = path
                    }
                })
            )
            request = functions.removeEmptyFields(request)
            const data = this.subjectFileRepository.create({ ...request, subject_id })
            const result = await this.subjectFileRepository.save(data)
            if (!result) {
                throw new Error("Store Subject Fail")
            }
            return result
        } catch (error: any) {
            return error
        }
    }

    public async delete(id: string) {
        const data = await this.subjectFileRepository.findOne({ where: { id } })
		if (!data) {
			return false
		}
		const result = await this.subjectFileRepository.remove(data)
		if (!result) {
			return false
		}
        await fileService.deleteFile(data.path)
		return result
    }
}

