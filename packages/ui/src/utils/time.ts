export type DateInput = Date | string | number

const minute = 60_000
const hour = 60 * minute
const day = 24 * hour

const asDate = (value: DateInput) =>
  value instanceof Date ? value : new Date(value)

export const formatLocalDate = (value: DateInput, locale = 'zh-CN') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(asDate(value))

export const formatLocalDateTime = (value: DateInput, locale = 'zh-CN') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(asDate(value))

export const formatRelativeDate = (
  value: DateInput,
  now: DateInput = new Date(),
) => {
  const difference = asDate(now).getTime() - asDate(value).getTime()

  if (difference < 0) return formatLocalDate(value)
  if (difference < minute) return '刚刚'
  if (difference < hour) return `${Math.floor(difference / minute)} 分钟前`
  if (difference < day) return `${Math.floor(difference / hour)} 小时前`
  if (difference < 2 * day) return '昨天'
  if (difference < 7 * day) return `${Math.floor(difference / day)} 天前`

  return formatLocalDate(value)
}
