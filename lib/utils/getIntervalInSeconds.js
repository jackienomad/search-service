export function getIntervalInSeconds(interval) {
  let calculatedSeconds = 1
  switch (interval) {
    case 'years':
      calculatedSeconds *= 12
    case 'months':
      calculatedSeconds *= 4
    case 'weeks':
      calculatedSeconds *= 7
    case 'days':
      calculatedSeconds *= 24 * 60 * 60
      break
    default:
      throw new Error('Invalid interval')
  }

  return calculatedSeconds
}

export default getIntervalInSeconds
