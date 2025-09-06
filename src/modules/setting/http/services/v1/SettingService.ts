import { AppDataSource } from '../../../../../index'
import functions from '../../../../../helpers/functions'
import { Setting } from '../../../models/setting.entity'
import fileService from '../../../../../services/fileService'
import Module from '../../../Module'

function generateUniqueFileName(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    let month: string | number = currentDate.getMonth() + 1;
    let day: string | number = currentDate.getDate();
    let hours: string | number = currentDate.getHours();
    let minutes: string | number = currentDate.getMinutes();
    let period = 'am';

    // Pad single digits with zero
    if (month < 10) month = `0${month}`;
    if (day < 10) day = `0${day}`;
    if (hours > 12) {
        hours -= 12;
        period = 'pm';
    }
    if (hours === 0) hours = 12;
    if (minutes < 10) minutes = `0${minutes}`;

    // Generate a random number between 1 and 10000
    const randomNumber = Math.floor(Math.random() * 10000) + 1;

    // Construct the filename
    const filename = `${year}-${month}-${day}_${hours}${minutes}${period}_${randomNumber}`;
    return filename;
}

export default class SettingService {
	private settingRepository = AppDataSource.getRepository(Setting)

	public async index() {
		const data = await this.settingRepository.find()
		return { data:data[0] }
	}

	public async update(request: any, files: any = null) {
		try {
			const setting = await this.settingRepository.find()
			request = functions.removeEmptyFields(request)
            if (Array.isArray(files) && files.length > 0) {
                await Promise.all(
                    files.map((file: { fieldname: string, originalname: string; buffer: Buffer }) => {
                        const fileName = generateUniqueFileName()
                        const uploadPath = Module.filePath + fileName + "." + file.originalname.split('.').pop()!.toLowerCase()
                        return fileService.uploadFile(uploadPath, file.buffer).then((savedName: string) => {
                            if (file.fieldname == 'icon') {
                                request.icon = savedName
                            } else if (file.fieldname == 'logo') {
                                request.logo = savedName
                            } else if (file.fieldname == 'login_image') {
                                request.login_image = savedName
                            }
                        })
                    })
                )
            }
			const data = this.settingRepository.merge(setting[0], { ...request })
			const result = await this.settingRepository.save(data)
			if (!result) {
				throw new Error("Update Setting Fail")
			}
			return result
		} catch (error: any) {
		return error
		}
	}
}
