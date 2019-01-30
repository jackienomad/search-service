import express from 'express'
import RefinementsController from '~/controllers/RefinementsController'

const router = express.Router()

router.get(
  '/v2/:country/:shipmentType/shipments/search/refinements',
  RefinementsController.get
)
module.exports = router
