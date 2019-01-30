import SuggestedKeywords from 'query-builder/lib/search/SuggestedKeywords'
import SuggestedFields from 'query-builder/lib/search/SuggestedFields'
import { parseDates, flatten } from 'query-builder/lib/utils/parseDates'
import client from '~/elasticsearch/client'
import { getIndexMapping } from '~/config/shipments'

const defaultKeywordsCount = 5

export class SuggestedController {
  static async suggestedKeywords(req, res, next) {
    try {
      const { country, shipmentType } = req.params
      const { keyword } = req.query
      let { fields, arrivalDates } = req.query

      const {
        keywordSuggestedFieldsMappingArray: fieldMap = null
      } = getIndexMapping(country, shipmentType)['suggested']

      // flatten fields into an array
      fields = flatten(fields)

      // flatten arrival dates into an array
      const [arrivalDate] = parseDates(arrivalDates)

      // generate query with the query builder
      const suggestedKeywords = new SuggestedKeywords(fieldMap, fields.slice())
      const query = suggestedKeywords.buildQuery(
        keyword,
        arrivalDate.start,
        arrivalDate.end,
        defaultKeywordsCount
      )

      // send request to ES
      const esResponse = await client.msearch(query)

      // process results
      const data = suggestedKeywords.formatResponse(esResponse)

      return res.status(200).send({
        success: true,
        data
      })
    } catch (e) {
      next(e)
    }
  }

  static async suggestedFields(req, res, next) {
    try {
      const { country, shipmentType } = req.params
      const { keyword } = req.query
      let { arrivalDates } = req.query

      const {
        keywordSuggestedFieldsMappingArray: fieldMap = null
      } = getIndexMapping(country, shipmentType)['suggested']

      // flatten arrival dates into an array
      const [arrivalDate] = parseDates(arrivalDates)

      // build suggested fields query
      const suggestedFields = new SuggestedFields(fieldMap)
      const query = suggestedFields.buildQuery(
        keyword,
        arrivalDate.start,
        arrivalDate.end
      )

      // send request to ES
      const esResponse = await client.msearch(query)

      // format es response
      const data = suggestedFields.formatResponse(esResponse)

      return res.status(200).send({
        success: true,
        data
      })
    } catch (e) {
      next(e)
    }
  }
}

export default SuggestedController
