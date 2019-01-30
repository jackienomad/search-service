import express from 'express'
import SummaryController from '~/controllers/SummaryController'

const router = express.Router()

router.get(
  '/v1/:country/:shipmentType/shipments/summary',
  SummaryController.get
)
module.exports = router
