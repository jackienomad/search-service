import request from 'supertest'
import express from 'express'
import searchRoutes from '~/routes/searchRoutes'
import { response } from './response'
import path from 'path'
import { loadYml } from 'query-builder/lib/utils/loadYml'
import errorHandler from '@/middleware/default/errorHandler'
import faker from 'faker'

const app = express()
app.use(searchRoutes)
app.use(errorHandler)

const client = request(app)

const { searchModifiers, searchOperators } = loadYml(
  path.resolve('config', 'search_conditions')
)

describe('Get search endpoint', () => {
  const country = 'us'
  const shipmentType = 'import'

  afterAll(done => request.close(done))

  // there are times that jest failed because of async
  beforeEach(() => {
    jest.setTimeout(5000)
  })

  async function makeSuccessfulRequest() {
    const correctUrl =
      `/v1/${country}/${shipmentType}/shipments/search` +
      `?keyword[]=apple,and,${
        searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
      },Consignee&` +
      `keyword[]=banana,and,${
        searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
      },Consignee&` +
      `include[]=CA,ConsigneeState&` +
      `include[]=WA,ConsigneeState&` +
      `exclude[]=IRVINE,ConsigneeCity&` +
      `misc=BlankConsigneesExcluded&` +
      `arrivalDates=1534867200-1536192000&` +
      `page=1&limit=20&sortBy=-Shipper`
    return await client.get(correctUrl)
  }

  describe('Successful request', () => {
    beforeEach(() => {
      jest.setTimeout(6000)
    })

    it('Successful request should return status code 200 arrivalDate', async () => {
      const correctUrl =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?arrivalDates=1538064000-1545782400&page=1&limit=20&sortBy=-ArrivalDate`

      const { status } = await client.get(correctUrl)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Successful request should return status code 200', async () => {
      const { status } = await makeSuccessfulRequest()
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work for any type-case of search operator', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=${faker.random.word()},and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=${faker.random.word()},AND,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `limit=20&sortBy=-Shipper`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work for any type-case of search modifier', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=${faker.random.word()},and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=${faker.random.word()},and,${searchModifiers[
          Math.floor(Math.random() * searchModifiers.length)
        ].toUpperCase()},Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `limit=20&sortBy=-Shipper`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work even the page is missing in the query', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=${faker.random.word()},and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=${faker.random.word()},and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `limit=20&sortBy=-Shipper`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work even the limit is missing in the query', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `sortBy=-Shipper`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work even the sortBy is missing in the query', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work even the include is missing', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work even the exclude is missing', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should work even the misc field is missing', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `arrivalDates=1534867200-1536192000&`

      const { status } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Should return the param object as expected', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,exact,Consignee&` +
        `keyword[]=banana,and,regular,Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&`

      const { status, body } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
      expect(body.params).toEqual(response)
    })

    it('Should work without the keyword', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search?` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&`

      const { status, body } = await client.get(url)
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
      expect(body.success).toEqual(true)
    })
  })

  describe('Unsuccessful requests', () => {
    beforeEach(() => {
      jest.setTimeout(5000)
    })

    it('One of the search operator is not equal to the operator field mapping', async () => {
      const invalidOperator = 'invalidOperator'
      const andOperator =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,${invalidOperator},fuzzy,Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(andOperator)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('is not a valid operator')
    })

    it('One of the search modifier is not equal to the modifier field mapping', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,normal,Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('is not a valid modifier')
    })

    it('In Include, search keyword should not be empty ', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain(
        'include query, search keyword should not be empty'
      )
    })

    it('In Include, field mapping should be a valid field mapper', async () => {
      const failedMapping = faker.random.word()
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,${failedMapping}&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain(
        `include query, ${failedMapping} is not a valid field mapper`
      )
    })

    it('In Exclude, search keyword should not be empty ', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain(
        'exclude query, search keyword should not be empty'
      )
    })

    it('should validate the misc mapping field', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=${faker.random.word()}&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('field is not a valid field mapper')
    })

    it('should validate the arrival date field', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=ad-1536192000&` +
        `page=1&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('invalid arrival Date')
    })

    it('should throw error page field should be number', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=a&limit=20&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('page should be a number')
    })

    it('should throw error limit field should be number', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=a&sortBy=-Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('limit should be a number')
    })

    it('should throw error if sortBy is not a search mapped field', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=1&sortBy=Shipper1111`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('sort by is not a valid map field')
    })

    it('should throw error if operator is empty', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=1&sortBy=Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('operator is empty')
    })

    it('should throw error if modifier is empty', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=1&sortBy=Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('modifier is empty')
    })

    it('should throw error if modifier is not a valid modifier', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,${faker.random.word()},Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=1&sortBy=Shipper`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('is not a valid modifier')
    })

    it('should throw error if sortBy is not a valid sortBy field', async () => {
      const url =
        `/v1/${country}/${shipmentType}/shipments/search` +
        `?keyword[]=apple,and,fuzzy,Consignee&` +
        `keyword[]=banana,and,fuzzy,Shipper&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1&limit=1&sortBy=${faker.random.word}`

      const { status, body } = await client.get(url)
      expect(+status).toEqual(400)
      expect(body.reason).toContain('sort by is not a valid map field')
    })
  })
})
