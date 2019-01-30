export class ShipmentSearchValidationDecorator {
  static decorate(validation) {
    validation.validate = query => {
      const { limit, misc } = validation.validateQuery(query)

      let page =
        query.hasOwnProperty('page') === false
          ? validation.defaultPageNumber
          : validation.validateNumber('page', query.page)

      let sortBy =
        query.hasOwnProperty('sortBy') === false
          ? validation.shipmentFieldMapping.defaultSortBy
          : validation.validateSortBy(query.sortBy)

      return { page, limit, sortBy, misc }
    }

    return validation
  }
}

export default ShipmentSearchValidationDecorator
