import express from 'express'
import AnalyticsController from '~/controllers/AnalyticsController'

const router = express.Router()

router.get(
  '/v2/:country/:shipmentType/shipments/analytics/:analyticsFields',
  AnalyticsController.get
)
module.exports = router
