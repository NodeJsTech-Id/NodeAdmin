import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(tz)

export function convertDatesDeep<T = any>(value: T, timezone: string): T {
  const visit = (v: any): any => {
    if (v == null) return v
    if (v instanceof Date) return dayjs.utc(v).tz(timezone).format('YYYY-MM-DDTHH:mm:ssZ')
    if (Array.isArray(v)) return v.map(visit)
    if (typeof v === 'object') {
      const out: any = Array.isArray(v) ? [] : {}
      for (const [k, val] of Object.entries(v)) out[k] = visit(val)
      return out
    }
    return v
  }
  return visit(value)
}

