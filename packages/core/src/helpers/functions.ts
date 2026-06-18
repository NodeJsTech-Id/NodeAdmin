export default class Function {
    public static removeEmptyFields(obj: any) {
        Object.keys(obj).forEach(key => {
            if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
                delete obj[key]
            }
        })
        return obj
    }
}

// Pencarian substring case-insensitive yang portabel di semua dialek TypeORM.
// MySQL `LIKE` default case-insensitive, tapi Postgres/SQLite case-sensitive dan
// `ILIKE` hanya ada di Postgres. `LOWER(col) LIKE LOWER(:p)` berlaku di semua dialek.
// Mengembalikan tuple [fragmen SQL, params] untuk dipakai di QueryBuilder.andWhere().
export const ciLike = (
    column: string,
    param: string,
    value: string
): [string, { [key: string]: string }] => {
    return [`LOWER(${column}) LIKE LOWER(:${param})`, { [param]: `%${value}%` }]
}

// Pagination terpusat (DRY) — pola skip/take + paginate_data yang sebelumnya
// diulang di tiap service. Terima QueryBuilder + kondisi (sudah tanpa prefix q_).
export interface PaginateResult<T> {
    datas: T[]
    paginate_data: {
        total_data: number
        page_size: number
        current_page: number
        total_page: number
    }
}

export async function paginate<T>(
    query: { skip: (n: number) => any; take: (n: number) => any; getManyAndCount: () => Promise<[T[], number]> },
    conditions: { page?: any; page_size?: any },
): Promise<PaginateResult<T>> {
    const pageSize = parseInt(conditions.page_size ?? 10)
    const page = parseInt(conditions.page ?? 1)
    const q = query.skip(!conditions.page ? 0 : (page - 1) * pageSize).take(pageSize)
    const [datas, total] = await q.getManyAndCount()
    return {
        datas,
        paginate_data: {
            total_data: total,
            page_size: pageSize,
            current_page: page,
            total_page: Math.ceil(total / pageSize),
        },
    }
}

export const removePrefix = (conditions: { [key: string]: any }, prefix: string): { [key: string]: any } => {
    const result: { [key: string]: any } = {}
    Object.keys(conditions).forEach((key) => {
        if (key.startsWith(prefix)) {
            const newKey = key.substring(prefix.length)
            result[newKey] = conditions[key]
        } else {
            result[key] = conditions[key]
        }
    })
    return result
}
