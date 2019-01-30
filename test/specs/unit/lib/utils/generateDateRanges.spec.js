import generateDateRanges from '@/utils/generateDateRanges'

describe('generateDateRanges', () => {
  it('should generate correct date ranges', () => {
    const arrivalDates = '1534867200 - 1536192000' // Thu, 29 Sep 2018 10:36:32 GMT - Thu, 29 Nov 2018 10:36:32 GMT
    const scale = 'weeks'
    const timezone = 'Asia/Manila'

    expect(generateDateRanges(arrivalDates, scale, timezone)).toEqual([
      {
        end: 1535471999,
        start: 1534867200
      },
      {
        end: 1536076799,
        start: 1535472000
      },
      {
        end: 1536192000,
        start: 1536076800
      }
    ])
  })
})
