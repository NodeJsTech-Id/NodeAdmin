import { Response } from 'express'
import path from 'path'

/**
 * Konfigurasi path view backend, di-inject oleh app saat bootstrap
 * (bukan import `config/app` agar core tetap generik & app-agnostic).
 * - `viewSegment`   → sub-path di dalam `<module>/views` (mis. '/be/default').
 * - `layoutSegment` → sub-path layout relatif './layouts' (mis. '/be/default').
 */
export interface ViewPathsConfig {
    viewSegment: string
    layoutSegment: string
}

let viewPaths: ViewPathsConfig | null = null

/** Dipanggil sekali oleh app saat bootstrap (sebelum request pertama). */
export function configureViewPaths(config: ViewPathsConfig) {
    viewPaths = config
}

/**
 * Render view backend (DRY) — menghilangkan pengulangan path.resolve + view-segment +
 * layout di setiap controller. `layout` default ke main; auth pakai 'full-width'.
 */
export function renderView(
    res: Response,
    modulePath: string,
    view: string,
    locals: Record<string, any> = {},
    layout: 'main' | 'full-width' = 'main',
) {
    if (!viewPaths) {
        throw new Error('[view] configureViewPaths() belum dipanggil saat bootstrap')
    }
    return res.render(
        path.resolve(modulePath, 'views' + viewPaths.viewSegment + '/' + view),
        { ...locals, layout: './layouts' + viewPaths.layoutSegment + '/' + layout },
    )
}
