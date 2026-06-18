import { Response } from 'express'
import path from 'path'
import appConfig from '../config/app'

/**
 * Render view backend (DRY) — menghilangkan pengulangan path.resolve + be_view +
 * layout di setiap controller. `layout` default ke main; auth pakai 'full-width'.
 */
export function renderView(
    res: Response,
    modulePath: string,
    view: string,
    locals: Record<string, any> = {},
    layout: 'main' | 'full-width' = 'main',
) {
    return res.render(
        path.resolve(modulePath, 'views' + appConfig.be_view + '/' + view),
        { ...locals, layout: './layouts' + appConfig.be_layout + '/' + layout },
    )
}
