import client from '~/elasticsearch/client'
import { getIndexMapping } from '~/config/shipments'
import { SearchBuilder } from 'query-builder/lib/search/SearchBuilder'
import { SearchFormatter } from 'query-builder/lib/search/SearchFormatter'
import {
  transformArray,
  refinementIndexes,
  keywordIndexes
} from 'query-builder/lib/search/searchUtils'
import ShipmentSearchValidation from '@/utils/ShipmentSearchValidation'
import ShipmentSearchValidationDecorator from '@/utils/ShipmentSearchValidationDecorator'

export class SearchController {
  static extractParameters(req) {
    const { country, shipmentType } = req.params
    const { fieldMap: fieldMapping } = getIndexMapping(country, shipmentType)

    const shipmentSearchValidation = new ShipmentSearchValidation(fieldMapping)

    const {
      misc,
      sortBy,
      limit,
      page
    } = ShipmentSearchValidationDecorator.decorate(
      shipmentSearchValidation
    ).validate(req.query)

    const { arrivalDates } = req.query
    let { keyword, include, exclude } = req.query

    const keywords = transformArray(keyword, keywordIndexes)
    include = transformArray(include, refinementIndexes)
    exclude = transformArray(exclude, refinementIndexes)

    return {
      country,
      shipmentType,
      misc,
      sortBy,
      limit,
      page,
      arrivalDates,
      keywords,
      include,
      exclude,
      fieldMapping
    }
  }

  static async search(req, res, next) {
    try {
      const {
        country,
        shipmentType,
        misc,
        sortBy,
        limit,
        page,
        arrivalDates,
        keywords,
        include,
        exclude,
        fieldMapping
      } = SearchController.extractParameters(req)

      let searchBuilder = new SearchBuilder(
        `${country}_${shipmentType}`,
        'shipment',
        fieldMapping
      )

      const query = searchBuilder.buildQuery(
        keywords,
        include,
        exclude,
        misc,
        sortBy,
        limit,
        page,
        arrivalDates
      )

      const response = await client.search(query)
      const { total } = response.hits
      const data = SearchFormatter.formatResponse(response)

      searchBuilder.destroy()
      searchBuilder = null

      return res.status(200).send({
        success: true,
        data,
        total,
        params: {
          country,
          shipmentType,
          keywords,
          include,
          exclude,
          misc,
          arrivalDates,
          page,
          limit,
          sortBy
        }
      })
    } catch (e) {
      next(e)
    }
  }
}

export default SearchController
