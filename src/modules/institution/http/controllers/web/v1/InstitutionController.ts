import { Request, Response } from "express"
import InstitutionService from "../../../services/v1/InstitutionService"
import path from "path"
import Module from "../../../../Module"


export default class InstitutionController {
    private institutionService = new InstitutionService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data,types,users} = await this.institutionService.index(filter)
        res.render(path.resolve(Module.path, 'views/institution/index'), {
            filter,
            datas,
            paginate_data,
            types,
            users,
            layout: './layouts/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {users} = await this.institutionService.create()
        res.render(path.resolve(Module.path, 'views/institution/create'), {
            users,
            layout: './layouts/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.institutionService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Institution Success.' }
            res.redirect('/admin/v1/institution')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect('/admin/v1/institution/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const {data,users} = await this.institutionService.edit(req.params.id)
        res.render(path.resolve(Module.path, 'views/institution/edit'), {
            data,
            users,
            layout: './layouts/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.institutionService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Institution Success.' }
            res.redirect('/admin/v1/institution')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect('/admin/v1/institution/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const result = await this.institutionService.delete(req.params.id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Delete Institution Success.' }
            res.redirect('/admin/v1/institution')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            res.redirect('/admin/v1/institution')
        }
    }

    public async delete_selected(req: Request, res: Response) {
        try {
            req.body.selected.forEach(async (id: string) => {
                await this.institutionService.delete(id)
            })
            req.session.flashMessage = { key: 'success', message: 'Delete Institution Success.' }
            res.redirect('/admin/v1/institution')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            res.redirect('/admin/v1/institution')
        }
    }

    public async generate_refferal(req: Request, res: Response) {
        const result = await this.institutionService.generate_refferal()
        res.json({ refferal: result })
    }

    public async promotion(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.institutionService.index_promotion(req.params.id, filter)
        res.render(path.resolve(Module.path, 'views/institution/promotion'), {
            filter,
            datas,
            paginate_data,
            id: req.params.id,
            layout: './layouts/main'
        })
    }
}