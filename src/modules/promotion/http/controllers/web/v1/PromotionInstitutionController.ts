import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import PromotionService from '../../../services/v1/PromotionService'
import appConfig from '../../../../../../config/app'

export default class PromotionInstitutionController {
    private promotionService = new PromotionService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {promotion,datas,paginate_data,types,users} = await this.promotionService.index_institution(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/institution/index'), {
            promotion,
            datas,
            filter,
            paginate_data,
            types,
            users,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {promotion,institutions} = await this.promotionService.create_institution(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/institution/create'), {
            promotion,
            institutions,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.promotionService.store_institution(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Add Institution Success.' }
            res.redirect(`/admin/v1/promotion/${req.params.id}/institution`)
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect(`/admin/v1/promotion/${req.params.id}/institution/create`)
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.promotionService.delete_institution(req.params.id,req.params.institution_id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Remove Institution Fail.' }
            res.redirect(`/admin/v1/promotion/${req.params.id}/institution`)
        }
        req.session.flashMessage = { key: 'success', message: 'Remove Institution Success.' }
        res.redirect(`/admin/v1/promotion/${req.params.id}/institution`)
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.promotionService.delete_institution(req.params.id,id)
        })
        req.session.flashMessage = { key: 'success', message: 'Remove Institution Success.' }
        res.redirect(`/admin/v1/promotion/${req.params.id}/institution`)
    }
}