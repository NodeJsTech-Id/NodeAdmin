/**
 * Helper pembaca environment generik (tervalidasi & ter-konversi tipe).
 * Dipisah dari objek `env` app-spesifik agar dapat dipakai ulang app turunan:
 * app cukup `makeEnvHelpers({ isProd })` lalu membangun objek env-nya sendiri.
 */
export interface EnvHelpers {
    /** Wajib ada; fail-fast di production bila kosong, fallback dev di non-prod. */
    required(name: string, fallbackDev?: string): string
    /** Integer dari env, atau default bila tak valid. */
    num(name: string, def: number): number
    /** Boolean ('true'/'1') dari env, atau default. */
    bool(name: string, def?: boolean): boolean
}

export function makeEnvHelpers(opts: { isProd: boolean }): EnvHelpers {
    const { isProd } = opts

    function required(name: string, fallbackDev?: string): string {
        const val = process.env[name]
        if (val && val.trim() !== '') return val
        if (isProd) {
            throw new Error(`[env] ${name} wajib di-set di production`)
        }
        console.warn(`[env] ${name} tidak di-set — memakai nilai dev sementara`)
        return fallbackDev ?? `dev-${name.toLowerCase()}`
    }

    function num(name: string, def: number): number {
        const v = process.env[name]
        const n = v ? parseInt(v, 10) : NaN
        return Number.isFinite(n) ? n : def
    }

    function bool(name: string, def = false): boolean {
        const v = process.env[name]
        if (v === undefined) return def
        return v === 'true' || v === '1'
    }

    return { required, num, bool }
}
