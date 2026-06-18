export function getTimezones(): string[] {
  try {
    // Node 20+ supports this and ships with full-icu typically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const intl: any = Intl as any
    if (typeof intl.supportedValuesOf === 'function') {
      return intl.supportedValuesOf('timeZone') as string[]
    }
  } catch {}
  // Fallback: a reasonable subset
  return [
    'UTC', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Moscow',
    'Africa/Johannesburg', 'Asia/Jakarta', 'Asia/Bangkok', 'Asia/Singapore',
    'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Kolkata',
    'Australia/Sydney', 'Pacific/Auckland', 'America/New_York', 'America/Chicago',
    'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo'
  ]
}

