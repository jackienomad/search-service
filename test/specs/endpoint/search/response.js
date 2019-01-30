export const response = {
  country: 'us',
  shipmentType: 'import',
  keywords: [
    {
      keyword: 'apple',
      operator: 'and',
      type: 'exact',
      field: 'Consignee'
    },
    {
      keyword: 'banana',
      operator: 'and',
      type: 'regular',
      field: 'Consignee'
    }
  ],
  page: 1,
  limit: 20,
  arrivalDates: '1534867200-1536192000',
  sortBy: '-Shipper',
  include: [
    {
      keyword: 'CA',
      field: 'ConsigneeState'
    },
    {
      keyword: 'WA',
      field: 'ConsigneeState'
    }
  ],
  exclude: [
    {
      keyword: 'IRVINE',
      field: 'ConsigneeCity'
    }
  ],
  misc: ['BlankConsigneesExcluded']
}
