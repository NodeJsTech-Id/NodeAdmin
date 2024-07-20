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
