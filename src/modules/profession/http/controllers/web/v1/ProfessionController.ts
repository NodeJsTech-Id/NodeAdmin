import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ProfessionService from '../../../services/v1/ProfessionService'

export default class ProfessionController {
    private professionService = new ProfessionService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.professionService.index(filter)
        res.render(path.resolve(Module.path, 'views/profession/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views/profession/create'), {
            layout: './layouts/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.professionService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Profession Success.' }
            res.redirect('/admin/v1/profession')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/profession/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.professionService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views/profession/edit'), {
            data,
            layout: './layouts/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.professionService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Profession Success.' }
            res.redirect('/admin/v1/profession')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/profession/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.professionService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Profession Fail.' }
            return res.redirect('/admin/v1/profession')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Profession Success.' }
        res.redirect('/admin/v1/profession')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.professionService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Profession Success.' }
        res.redirect('/admin/v1/profession')
    }
}