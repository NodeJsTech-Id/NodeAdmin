import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'
import ClassService from '../../../services/v1/ClassService'

export default class ClassController {
    private classService = new ClassService

    public async index(req: Request, res: Response) {
        const filter = req.query
        const {datas,paginate_data} = await this.classService.index(filter)
        res.render(path.resolve(Module.path, 'views/be/class/index'), {
            datas,
            filter,
            paginate_data,
            layout: './layouts/be/main'
        })
    }

    public async create(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views/be/class/create'), {
            layout: './layouts/be/main'
        })
    }

    public async store(req: Request, res: Response) {
        try {
            const result = await this.classService.store(req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Store Class Success.' }
            res.redirect('/admin/v1/class')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            req.session.old = req.body
            return res.redirect('/admin/v1/class/create')
        }
    }

    public async edit(req: Request, res: Response) {
        const result = await this.classService.edit(req.params.id)
        const data = result
        res.render(path.resolve(Module.path, 'views/be/class/edit'), {
            data,
            layout: './layouts/be/main'
        })
    }

    public async update(req: Request, res: Response) {
        try {
            const result = await this.classService.update(req.params.id, req.body)
            if (result instanceof Error) {
                throw new Error(result.message)
            }
            req.session.flashMessage = { key: 'success', message: 'Update Class Success.' }
            res.redirect('/admin/v1/class')
        } catch (err: any) {
            req.session.flashMessage = { key: 'error', message: err.message }
            return res.redirect('/admin/v1/class/'+req.params.id+'/edit')
        }
    }

    public async delete(req: Request, res: Response) {
        const result = await this.classService.delete(req.params.id)
        if (!result) {
            req.session.flashMessage = { key: 'error', message: 'Delete Class Fail.' }
            return res.redirect('/admin/v1/class')
        }
        req.session.flashMessage = { key: 'success', message: 'Delete Class Success.' }
        res.redirect('/admin/v1/class')
    }

    public async delete_selected(req: Request, res: Response) {
        req.body.selected.forEach(async (id: string) => {
            await this.classService.delete(id)
        })
        req.session.flashMessage = { key: 'success', message: 'Delete Class Success.' }
        res.redirect('/admin/v1/class')
    }
}