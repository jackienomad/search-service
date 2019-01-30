import client from '~/elasticsearch/client'
import { getIndexMapping } from '~/config/shipments'
import AnalyticsBuilder from 'query-builder/lib/search/analytics/AnalyticsBuilder'
import AnalyticsFormatter from 'query-builder/lib/search/analytics/AnalyticsFormatter'
import SearchBuilder from 'query-builder/lib/search/SearchBuilder'
import { ShipmentSearchValidation } from '@/utils/ShipmentSearchValidation'
import ShipmentAnalyticsValidationDecorator from '@/utils/ShipmentAnalyticsValidationDecorator'
import {
  transformArray,
  refinementIndexes,
  keywordIndexes
} from 'query-builder/lib/search/searchUtils'

export class AnalyticsController {
  static async get(req, res, next) {
    try {
      const { country, shipmentType, analyticsFields } = req.params

      const {
        fieldMap: shipmentFieldMapping,
        analytics: shipmentAnalyticsFieldMapping
      } = getIndexMapping(country, shipmentType)

      const mergedFieldMapping = {
        ...shipmentFieldMapping,
        ...shipmentAnalyticsFieldMapping
      }

      const shipmentSearchValidation = new ShipmentSearchValidation(
        mergedFieldMapping
      )

      const { analyticsAnalyzeFields } = shipmentAnalyticsFieldMapping
      if (
        Object.keys(analyticsAnalyzeFields).includes(analyticsFields) === false
      ) {
        throw new Error(`${analyticsFields} is not a valid field`)
      }

      const shipmentAnalyticsValidation = ShipmentAnalyticsValidationDecorator.decorate(
        shipmentSearchValidation
      )

      const {
        keyword,
        include,
        exclude,
        misc,
        arrivalDates,
        limit,
        sortBy
      } = shipmentAnalyticsValidation.validate(req.query)

      const searchBuilder = new SearchBuilder(
        `${country}_${shipmentType}`,
        'shipment',
        shipmentFieldMapping
      )

      const builder = new AnalyticsBuilder(searchBuilder, mergedFieldMapping)
      const keywords = transformArray(keyword, keywordIndexes)
      const includes = transformArray(include, refinementIndexes)
      const excludes = transformArray(exclude, refinementIndexes)

      const query = builder.buildQuery(
        analyticsFields,
        keywords,
        includes,
        excludes,
        misc,
        sortBy,
        limit,
        arrivalDates
      )

      const response = await client.search(query)

      const formatter = new AnalyticsFormatter(response)

      shipmentAnalyticsValidation.destroy()
      formatter.destroy()
      return res.status(200).send({
        success: true,
        data: formatter.format()
      })
    } catch (e) {
      next(e)
    }
  }
}

export default AnalyticsController
