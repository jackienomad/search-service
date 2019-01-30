import express from 'express'
import SearchController from '~/controllers/SearchController'

const router = express.Router()

router.get(
  '/v1/:country/:shipmentType/shipments/search',
  SearchController.search
)
module.exports = router
