import express from 'express'
import GenerateQueryController from '~/controllers/GenerateQueryController'

const router = express.Router()

router.get(
  '/v1/:country/:shipmentType/shipments/generateQuery',
  GenerateQueryController.generateQuery
)

module.exports = router
