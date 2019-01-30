import { loadYml } from 'query-builder/lib/utils/loadYml'
import { parseDates } from 'query-builder/lib/utils/parseDates'
import path from 'path'

const searchConditions = loadYml(path.resolve('config', 'search_conditions'))

export class ShipmentSearchValidation {
  constructor(shipmentFieldMapping) {
    this.shipmentFieldMapping = shipmentFieldMapping
    const { searchOperators, searchModifiers } = searchConditions
    this.searchOperators = searchOperators
    this.searchModifiers = searchModifiers
    this.defaultPageNumber = 1
    this.defaultPageLimit = 20
  }

  validateKeywords(keywords) {
    keywords.forEach(keyword => {
      const concatKeyword = keyword.split(',')
      const length = concatKeyword.length
      const operator = concatKeyword[length - 3] || ''
      const modifier = concatKeyword[length - 2] || ''
      const mapping = concatKeyword[length - 1] || ''

      if (
        this.searchOperators.includes(operator.trim().toLowerCase()) === false
      ) {
        if (operator.length <= 0) {
          throw Error('operator is empty')
        }
        throw Error(`${operator.trim()} is not a valid operator`)
      }

      if (
        this.searchModifiers.includes(modifier.trim().toLowerCase()) === false
      ) {
        if (modifier.length <= 0) {
          throw Error('modifier is empty')
        }
        throw Error(`${modifier.trim()} is not a valid modifier`)
      }

      if (typeof this.shipmentFieldMapping[mapping.trim()] !== 'object') {
        throw Error(`${mapping.trim()} is not a valid field mapper`)
      }
    })

    return this
  }

  validateRefinedBy(name, refined) {
    refined.forEach(include => {
      const concatInclude = include.split(',')
      const searchKeyword = concatInclude[0] || ''
      const mapping = concatInclude[1] || ''
      if (searchKeyword.trim().length <= 0) {
        throw Error(`${name} query, search keyword should not be empty`)
      }

      if (typeof this.shipmentFieldMapping[mapping.trim()] !== 'object') {
        throw Error(
          `${name} query, ${mapping.trim()} is not a valid field mapper`
        )
      }
    })

    return this
  }

  validateMisc(miscs) {
    const concatMisc = miscs.split(',').filter(misc => misc !== '')
    concatMisc.forEach(misc => {
      const field = misc.trim()
      if (this.shipmentFieldMapping.miscField.includes(field) === false) {
        throw Error(`${field} field is not a valid field mapper`)
      }
    })
    return this
  }

  validateArrivalDates(arrivalDates) {
    const [dates] = parseDates(arrivalDates)
    const { start, end } = dates

    if (Number.isNaN(start) || Number.isNaN(end)) {
      throw Error('invalid arrival Date')
    }
    return this
  }

  validateNumber(title, number) {
    if (!Number.isInteger(parseInt(number))) {
      throw Error(`${title} should be a number`)
    }

    return number
  }

  validateSortBy(field) {
    const regex = /^[+-]?\w+$/g
    const checkField = field.match(regex)

    if (checkField === null) {
      throw Error('sort by is not a valid map field')
    }

    const [sortBy] = checkField
    const mathSignRegex = /^[+-]/gi
    const removedMathSign = sortBy.replace(mathSignRegex, '')
    if (typeof this.shipmentFieldMapping[removedMathSign.trim()] !== 'object') {
      throw Error('sort by is not a valid map field')
    }

    return field
  }

  validateQuery(query) {
    if (query.hasOwnProperty('keyword')) {
      this.validateKeywords(query.keyword)
    }

    if (query.hasOwnProperty('include')) {
      this.validateRefinedBy('include', query.include)
    }

    if (query.hasOwnProperty('exclude')) {
      this.validateRefinedBy('exclude', query.exclude)
    }

    if (query.hasOwnProperty('misc')) {
      this.validateMisc(query.misc)
    }

    if (query.hasOwnProperty('arrivalDates') === false) {
      throw new Error('arrivalDates is required')
    }

    this.validateArrivalDates(query.arrivalDates)

    let limit =
      query.hasOwnProperty('limit') === false
        ? this.defaultPageLimit
        : this.validateNumber('limit', query.limit)

    const misc = query.misc === undefined ? [] : query.misc.split(',')
    return {
      keyword: query.keyword,
      include: query.include,
      exclude: query.exclude,
      misc,
      arrivalDates: query.arrivalDates,
      limit
    }
  }

  destroy() {
    this.shipmentFieldMapping = null
    this.searchOperators = null
    this.searchModifiers = null
    this.defaultPageLimit = null
    this.defaultPageNumber = null
  }
}

export default ShipmentSearchValidation
