import { parseDates } from 'query-builder/lib/utils/parseDates'
import { parseFromTimeZone } from 'date-fns-timezone'
import getIntervalInSeconds from '@/utils/getIntervalInSeconds'

export function generateDateRanges(arrivalDates, scale, timezone) {
  const [date] = parseDates(arrivalDates || '')
  const startDate = parseFromTimeZone(date.start * 1000, { timeZone: timezone })
  const endDate = parseFromTimeZone(date.end * 1000, { timeZone: timezone })

  // @NOTE: How come timezone isn't a factor in the php implementation? Should have been startDate.getTimezoneOffset() * 60
  const offset = 0
  const start = startDate.getTime() / 1000 + offset
  const end = endDate.getTime() / 1000 + offset

  const interval = getIntervalInSeconds(scale)
  const dateRanges = []

  for (let current = start; current <= end; current += interval) {
    const currentEnd = current + interval >= end ? end : current + interval - 1
    dateRanges.push({
      start: current,
      end: currentEnd
    })
  }

  return dateRanges
}

export default generateDateRanges
