import getIntervalInSeconds from '@/utils/getIntervalInSeconds'

describe('getIntervalInSeconds', () => {
  it('should compute year interval', () => {
    expect(getIntervalInSeconds('years')).toBe(29030400)
  })

  it('should compute month interval', () => {
    expect(getIntervalInSeconds('months')).toBe(2419200)
  })

  it('should compute week interval', () => {
    expect(getIntervalInSeconds('weeks')).toBe(604800)
  })

  it('should compute day interval', () => {
    expect(getIntervalInSeconds('days')).toBe(86400)
  })

  it('should throw an error for invalid intervals', () => {
    expect(() => {
      getIntervalInSeconds('invalidInterval')
    }).toThrowError()
  })
})
