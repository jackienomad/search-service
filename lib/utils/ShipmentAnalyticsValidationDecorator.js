const validateSortBy = (field, analyticsAggregateFields) => {
  const regex = /^[+-]?\w+$/g
  const checkField = field.match(regex)

  if (checkField === null) {
    throw Error('sort By is not a valid map field')
  }

  const [sortBy] = checkField
  const mathSignRegex = /^[+-]/gi
  const removedMathSign = sortBy.replace(mathSignRegex, '')
  if (typeof analyticsAggregateFields[removedMathSign.trim()] !== 'object') {
    throw Error('sort By is not a valid map field')
  }
}

export class ShipmentAnalyticsValidationDecorator {
  static decorate(validation) {
    validation.validate = query => {
      const {
        keyword,
        include,
        exclude,
        arrivalDates,
        misc
      } = validation.validateQuery(query)

      let limit = 0
      if (query.hasOwnProperty('limit') === false) {
        limit = validation.analyticsDefaultValueShow
      } else {
        validation.validateNumber('limit', query.limit)
        limit = query.limit
      }

      let sortBy = ''
      if (query.hasOwnProperty('sortBy') === false) {
        sortBy = validation.defaultDisplaySortBy
      } else {
        const { analyticsAggregateFields } = validation.shipmentFieldMapping
        validateSortBy(query.sortBy, analyticsAggregateFields)
        sortBy = query.sortBy
      }

      return {
        keyword,
        include,
        exclude,
        arrivalDates,
        misc,
        limit,
        sortBy
      }
    }

    return validation
  }
}

export default ShipmentAnalyticsValidationDecorator
