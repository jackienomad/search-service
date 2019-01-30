import client from '~/elasticsearch/client'
import { getIndexMapping } from '~/config/shipments'
import SummaryBuilder from 'query-builder/lib/search/summary/SummaryBuilder'
import SummaryFormatter from 'query-builder/lib/search/summary/SummaryFormatter'
import SearchBuilder from 'query-builder/lib/search/SearchBuilder'
import generateDateRanges from '@/utils/generateDateRanges'
import { ShipmentSearchValidation } from '@/utils/ShipmentSearchValidation'
import { ShipmentSummaryValidationDecorator } from '@/utils/ShipmentSummaryValidationDecorator'
import {
  transformArray,
  refinementIndexes,
  keywordIndexes
} from 'query-builder/lib/search/searchUtils'

export class SummaryController {
  static async get(req, res, next) {
    try {
      const { country, shipmentType } = req.params
      const { fieldMap: fieldMapping } = getIndexMapping(country, shipmentType)

      const shipmentSearchValidation = new ShipmentSearchValidation(
        fieldMapping
      )

      let {
        keyword,
        include,
        exclude,
        misc,
        arrivalDates,
        scale,
        timezone
      } = ShipmentSummaryValidationDecorator.decorate(
        shipmentSearchValidation
      ).validate(req.query)

      const keywords = transformArray(keyword, keywordIndexes)
      include = transformArray(include, refinementIndexes)
      exclude = transformArray(exclude, refinementIndexes)

      const dateRanges = generateDateRanges(arrivalDates, scale, timezone)

      let searchBuilder = new SearchBuilder(
        `${country}_${shipmentType}`,
        'shipment',
        fieldMapping
      )

      const searchQuery = searchBuilder.buildQuery(
        keywords,
        include,
        exclude,
        misc,
        [],
        0,
        0,
        arrivalDates
      )

      let summaryBuilder = new SummaryBuilder(fieldMapping)

      const query = summaryBuilder.buildQuery(
        searchQuery.body.query,
        searchBuilder.index,
        dateRanges
      )

      const { responses } = await client.msearch(query)

      let { total, items } = SummaryFormatter.formatResponse(
        responses,
        dateRanges,
        fieldMapping
      )

      searchBuilder.destroy()
      summaryBuilder.destroy()
      searchBuilder = null
      summaryBuilder = null

      return res.status(200).send({
        success: true,
        total,
        items
      })
    } catch (e) {
      next(e)
    }
  }
}

export default SummaryController
