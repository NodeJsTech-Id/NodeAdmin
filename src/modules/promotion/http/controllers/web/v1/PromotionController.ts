import { Request, Response } from "express"
import PromotionService from "../../../services/v1/PromotionService"
import path from "path"
import Module from "../../../../Module"
import appConfig from '../../../../../../config/app'

export default class PromotionController {
    private promotionService = new PromotionService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.promotionService.index(filter)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/promotion/index'), {
            filter,
            datas,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/promotion/create'), {
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.promotionService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Promotion Success.' }
            res.redirect('/admin/v1/promotion')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect('/admin/v1/promotion/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const {data} = await this.promotionService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views'+appConfig.be_view+'/promotion/edit'), {
            data,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.promotionService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Promotion Success.' }
            res.redirect('/admin/v1/promotion')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect('/admin/v1/promotion/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const result = await this.promotionService.delete(req.params.id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Delete Promotion Success.' }
            res.redirect('/admin/v1/promotion')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            res.redirect('/admin/v1/promotion')
        }
    }

    public async delete_selected(req: Request, res: Response) {
        try {
            req.body.selected.forEach(async (id: string) => {
                await this.promotionService.delete(id)
            })
            req.session.flashMessage = { key: 'success', message: 'Delete Promotion Success.' }
            res.redirect('/admin/v1/promotion')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            res.redirect('/admin/v1/promotion')
        }
    }

    public async generate_code(req: Request, res: Response) {
        const result = await this.promotionService.generate_code()
        res.json({ code: result })
    }
}