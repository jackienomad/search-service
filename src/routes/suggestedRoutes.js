import express from 'express'
import SuggestedController from '~/controllers/SuggestedController'

const router = express.Router()

router.get(
  '/v2/:country/:shipmentType/shipments/suggested/keywords',
  SuggestedController.suggestedKeywords
)

router.get(
  '/v2/:country/:shipmentType/shipments/suggested/fields',
  SuggestedController.suggestedFields
)

module.exports = router
