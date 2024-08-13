import { Request, Response } from 'express'
import path from 'path'
import Module from '../../../../Module'

export default class UserController {
    public async index(req: Request, res: Response) {
        res.render(path.resolve(Module.path, 'views/be/index'), {
            layout: './layouts/be/main'
        })
    }
}