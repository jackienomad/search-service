import SearchController from '~/controllers/SearchController'
import { SearchBuilder } from 'query-builder/lib/search/SearchBuilder'

export class GenerateQueryController {
  static generateQuery(req, res, next) {
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

      return res.status(200).send({
        success: true,
        query
      })
    } catch (e) {
      next(e)
    }
  }
}

export default GenerateQueryController
