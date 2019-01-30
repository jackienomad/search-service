import client from '~/elasticsearch/client'
import { getIndexMapping } from '~/config/shipments'
import { SearchBuilder } from 'query-builder/lib/search/SearchBuilder'
import { AggregatesBuilder } from 'query-builder/lib/search/AggregatesBuilder'
import { MiscAggregatesBuilder } from 'query-builder/lib/search/MiscAggregatesBuilder'
import { RefinementsFormatter } from 'query-builder/lib/search/RefinementsFormatter'
import { ShipmentSearchValidation } from '@/utils/ShipmentSearchValidation'
import { ShipmentRefinementsValidationDecorator } from '@/utils/ShipmentRefinementsValidationDecorator'
import {
  transformArray,
  refinementIndexes,
  keywordIndexes
} from 'query-builder/lib/search/searchUtils'

export class RefinementsController {
  static async get(req, res, next) {
    try {
      const { country, shipmentType } = req.params
      const {
        fieldMap: fieldMapping,
        refinementGroups: {
          Categories: refinementGroups,
          DefaultGroups: defaultGroups,
          DefaultMiscGroups: defaultMiscGroups
        }
      } = getIndexMapping(country, shipmentType)
      const shipmentSearchValidation = new ShipmentSearchValidation(
        fieldMapping
      )
      let {
        keyword,
        include,
        exclude,
        misc,
        arrivalDates,
        fields
      } = ShipmentRefinementsValidationDecorator.decorate(
        shipmentSearchValidation,
        defaultGroups,
        defaultMiscGroups
      ).validate(req.query)

      const keywords = transformArray(keyword, keywordIndexes)
      include = transformArray(include, refinementIndexes)
      exclude = transformArray(exclude, refinementIndexes)

      // support for special field 'All'
      if (fields.includes('All'))
        fields = [...defaultGroups, ...defaultMiscGroups]

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
        null,
        0,
        0,
        arrivalDates
      )

      // remove unneeded fields
      delete query.body.sort
      delete query.body.from
      delete query.body.track_scores

      // build suggestions aggregations
      const refinementAggregations = AggregatesBuilder.build(
        fields.filter(field => !defaultMiscGroups.includes(field)),
        fieldMapping
      )

      // build misc
      const countAggregations = MiscAggregatesBuilder.build(
        fields.filter(field => defaultMiscGroups.includes(field)),
        fieldMapping
      )

      query.body.aggregations = {
        ...refinementAggregations,
        ...countAggregations
      }

      const response = await client.search(query)

      // format data
      const data = RefinementsFormatter.format(response, refinementGroups)

      return res.status(200).send({
        success: true,
        data
      })
    } catch (e) {
      next(e)
    }
  }
}

export default RefinementsController
