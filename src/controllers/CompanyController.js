import { getIndexMapping } from '~/config/shipments'
import { parseDates, flatten } from 'query-builder/lib/utils/parseDates'
import ShipmentCount from 'query-builder/lib/search/ShipmentCount'
import client from '~/elasticsearch/client'
import generateDateRanges from '@/utils/generateDateRanges'

const whitelist = {
  traderTypes: ['consignee', 'shipper', 'internal'],
  intervals: ['days', 'weeks', 'months', 'years']
}
const defaults = {
  timezone: 'Asia/Manila',
  interval: 'weeks',
  size: 0,
  traderTypes: 'internal'
}

export function getParameters(params, query) {
  // extract url parameters
  const { country, shipmentType, companyId } = params

  // extract url query string
  const arrivalDates = parseDates(query.arrivalDates || '')
  const timezone = query.timezone || defaults.timezone
  const interval = query.interval || defaults.interval
  const size = !query.size ? defaults.size : +query.size
  const traderTypes = flatten(query.traderTypes || defaults.traderTypes)
  const dateRanges = generateDateRanges(query.arrivalDates, interval, timezone)

  return {
    country,
    shipmentType,
    companyId,
    arrivalDates,
    timezone,
    size,
    interval,
    traderTypes,
    dateRanges
  }
}

export class CompanyController {
  static validate(country, shipmentType, size, interval, traderTypes) {
    // validate country and shipmentType
    const {
      suggested: { keywordSuggestedFieldsMappingArray: fieldMap = null }
    } = getIndexMapping(country, shipmentType)
    if (!fieldMap) throw new Error('Invalid country or shipmentType')

    // validate size
    if (isNaN(size)) throw new Error('Invalid size')

    // validate interval
    if (!whitelist.intervals.includes(interval)) {
      throw new Error('Invalid interval')
    }

    // validate traderType
    const isTraderTypeValid = traderTypes.reduce(
      (acc, traderType) => acc && whitelist.traderTypes.includes(traderType),
      true
    )
    if (!isTraderTypeValid) {
      throw new Error('Invalid traderType')
    }
  }

  static async fetchAll(req, res, next) {
    try {
      const {
        country,
        shipmentType,
        companyId,
        interval,
        arrivalDates,
        timezone,
        size,
        traderTypes,
        dateRanges
      } = getParameters(req.params, req.query)

      const { fieldMap } = getIndexMapping(country, shipmentType)

      CompanyController.validate(
        country,
        shipmentType,
        size,
        interval,
        traderTypes
      )

      const query = ShipmentCount.buildQuery(
        fieldMap,
        country,
        shipmentType,
        companyId,
        dateRanges,
        traderTypes
      )
      const esResponse = await client.msearch(query)
      const data = ShipmentCount.formatResponse(
        esResponse,
        dateRanges,
        traderTypes,
        timezone
      )

      return res.status(200).send({
        success: true,
        country,
        shipmentType,
        companyId,
        arrivalDates,
        timezone,
        interval,
        size,
        traderTypes,
        data
      })
    } catch (e) {
      next(e)
    }
  }
}

export default CompanyController
