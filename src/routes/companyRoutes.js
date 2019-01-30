import express from 'express'
import CompanyController from '~/controllers/CompanyController'

const router = express.Router()

router.get(
  '/v2/:country/:shipmentType/companies/:companyId/shipments',
  CompanyController.fetchAll
)

module.exports = router
