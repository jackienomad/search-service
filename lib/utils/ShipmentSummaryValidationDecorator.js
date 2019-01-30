const scaleList = ['days', 'weeks', 'months', 'years']
const defaultScale = 'weeks'
const defaultTimezone = 'Asia/Manila'

const validateScale = scale => {
  if (scaleList.includes(scale.trim()) === false) {
    if (scale.length <= 0) {
      throw Error('scale is empty')
    }
    throw Error(`${scale.trim()} is not a valid scale`)
  }

  return scale
}

export class ShipmentSummaryValidationDecorator {
  static decorate(validation) {
    validation.validate = query => {
      const {
        keyword,
        include,
        exclude,
        arrivalDates,
        misc
      } = validation.validateQuery(query)

      const scale =
        !query.scale || !query.scale.length
          ? defaultScale
          : validateScale(query.scale)

      const timezone =
        !query.timezone || !query.timezone.length
          ? defaultTimezone
          : query.timezone

      return {
        keyword,
        include,
        exclude,
        arrivalDates,
        misc,
        scale,
        timezone
      }
    }

    return validation
  }
}

export default ShipmentSummaryValidationDecorator
