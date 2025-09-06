import { Request, Response, NextFunction } from 'express'
import { AppDataSource } from '../../../../index'
import { Permission } from '../../models/permission.entity'
import { User } from '../../models/user.entity'
import { Like } from 'typeorm'

const AccessMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const permissionRepository = AppDataSource.getRepository(Permission)
    const userRepository = AppDataSource.getRepository(User)

    let url = (req.path=='/')?'':req.path
    url = req.baseUrl+url
    let routeName: string
    let method: string

    const findRoute = await permissionRepository.findOne({
        select: ['url','method'],
        where: { url }
    })

    if (!findRoute) {
        const findRoute2 = await permissionRepository.find({
            select: ['url','method'],
            where: { url: Like('%:%') }
        })
        findRoute2.forEach( (route: { url: string, method: string }) => {
            const pathParts = route.url.split('/')
            const reqPathParts = url.split('/')
            if (pathParts.length === reqPathParts.length) {
                let match = true
                pathParts.forEach((part, index) => {
                    if (part !== reqPathParts[index] && !part.startsWith(':')) {
                        match = false
                    }
                })
                if (match) {
                    routeName = route.url
                    method = route.method
                }
            }
        })
    } else {
        routeName = findRoute.url
        method = findRoute.method
    }

    const user = req.user as User
    const roles = await userRepository.findOne({
        where: { id: user?.id },
        relations: ['roles', 'roles.permissions']
    })

    const hasAccess = roles?.roles.some((role: { permissions: { url: string; method: string }[] }) =>
        role.permissions.some((permission: { url: string; method: string }) =>
            permission.url === routeName && permission.method === method
        )
    )
    const isApi = roles?.roles.some((role: { permissions: any[] }) =>
        role.permissions.some((permission: { url: string | string[]; method: string }) =>
            permission.url === routeName && permission.method === method && permission.url.includes('/api/')
        )
    )

    if (!roles?.roles.some(role => role.name == 'Administrator')) {
        if (!hasAccess) {
            if (!isApi) {
                req.session.flashMessage = { key: 'error', message: 'Unauthorized.' }
                if (!req.isAuthenticated()) {
                    return res.redirect('/auth/login')
                }
                return res.redirect('back')
            } else {
                return res.status(402).json({ message: 'Unauthorized' })
            }
        }
    }

    next()
}

export default AccessMiddleware
