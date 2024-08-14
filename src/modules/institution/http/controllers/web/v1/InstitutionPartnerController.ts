import { Request, Response } from "express"
import InstitutionService from "../../../services/v1/InstitutionService"
import path from "path"
import Module from "../../../../Module"
import { User } from "../../../../../access/models/user.entity"
import appConfig from '../../../../../../config/app'

export default class InstitutionPartnerController {
    private institutionService = new InstitutionService

    public async index(req: Request, res: Response) {
        const filter = req.query
        filter.user_id = (req.user as User).id
        const {datas,paginate_data,types,users} = await this.institutionService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/partner/institution/index'), {
            filter,
            datas,
            paginate_data,
            types,
            users,
            layout: './layouts/be/main'
        })
    }

    public async edit(req: Request, res: Response) {
        const {data,users} = await this.institutionService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/partner/institution/edit'), {
            data,
            users,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.institutionService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Institution Success.' }
            res.redirect('/admin/v1/institution/partner')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect('/admin/v1/institution/partner/'+req.params.id+'/edit')
        }
    }

    public async generate_refferal(req: Request, res: Response) {
        const result = await this.institutionService.generate_refferal()
        res.json({ refferal: result })
    }

    public async promotion(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.institutionService.index_promotion(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/partner/institution/promotion'), {
            filter,
            datas,
            paginate_data,
            id: req.params.id,
            layout: './layouts/be/main'
        })
    }
}