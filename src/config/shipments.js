import { loadYml, getPresetFilename } from 'query-builder/lib/utils/loadYml'
import path from 'path'

// load shipment configs once
export const shipmentConfigs = {
  us_import: {}
}

shipmentConfigs.us_import.suggested = loadYml(
  path.resolve('config', 'us_import_shipments_suggested_keywords')
)
shipmentConfigs.us_import.fieldMap = loadYml(
  path.resolve('config', 'us_import_shipments_field_mapping')
)
shipmentConfigs.us_import.refinementGroups = loadYml(
  path.resolve('config', 'us_import_refined_by_groups')
)
shipmentConfigs.us_import.analytics = loadYml(
  path.resolve('config', 'us', 'import', 'analytics')
)

export function getIndexMapping(country, shipmentType) {
  return shipmentConfigs[`${country}_${shipmentType}`]
}

export default shipmentConfigs
