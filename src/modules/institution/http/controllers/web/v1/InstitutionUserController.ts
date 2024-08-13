import { Request, Response } from "express"
import InstitutionUserService from "../../../services/v1/InstitutionUserService"
import path from "path"
import Module from "../../../../Module"


export default class InstitutionUserUserController {
    private institutionUserService = new InstitutionUserService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {institution,datas,paginate_data} = await this.institutionUserService.index(req.params.institution_id, filter)
        res.render(path.resolve(Module.path, 'views/be/institution_user/index'), {
            filter,
            datas,
            paginate_data,
            institution,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        const {institution,users} = await this.institutionUserService.create(req.params.institution_id)
        res.render(path.resolve(Module.path, 'views/be/institution_user/create'), {
            users,
            institution,
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.institutionUserService.store(req.params.institution_id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Institution User Success.' }
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const {data,institution} = await this.institutionUserService.edit(req.params.institution_id, req.params.id)
        res.render(path.resolve(Module.path, 'views/be/institution_user/edit'), {
            data,
            institution,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.institutionUserService.update(req.params.institution_id, req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Institution User Success.' }
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        try {
            const result = await this.institutionUserService.delete(req.params.id)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Delete Institution User Success.' }
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user')
        }
    }

    public async delete_selected(req: Request, res: Response) {
        try {
            req.body.selected.forEach(async (id: string) => {
                await this.institutionUserService.delete(id)
            })
            req.session.flashMessage = { key: 'success', message: 'Delete Institution User Success.' }
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            res.redirect('/admin/v1/institution/'+req.params.institution_id+'/user')
        }
    }
}