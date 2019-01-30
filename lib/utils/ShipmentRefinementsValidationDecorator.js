import { flatten } from 'query-builder/lib/utils/parseDates'

export class ShipmentRefinementsValidationDecorator {
  static decorate(validation, defaultRefinementGroups, defaultMiscGroups) {
    validation.defaultRefinementGroups = defaultRefinementGroups
    validation.defaultMiscGroups = defaultMiscGroups
    validation.validate = query => {
      const {
        keyword,
        include,
        exclude,
        arrivalDates,
        misc
      } = validation.validateQuery(query)
      const fields = flatten(query.fields).filter(field => field !== '')

      // check for invalid fields
      if (!fields || !fields.length) {
        throw new Error('Missing parameter: fields')
      }

      const invalidFields = fields.filter(
        field =>
          !validation.defaultRefinementGroups.includes(field) &&
          !validation.defaultMiscGroups.includes(field) &&
          field !== 'All'
      )
      if (invalidFields && invalidFields.length) {
        throw new Error('Invalid fields: ' + invalidFields.join(', '))
      }

      return {
        keyword,
        include,
        exclude,
        arrivalDates,
        misc,
        fields
      }
    }

    defaultRefinementGroups = null
    defaultMiscGroups = null

    return validation
  }
}

export default ShipmentRefinementsValidationDecorator
