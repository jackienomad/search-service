import express from 'express'
import request from 'supertest'
import faker from 'faker'
import { response } from './response'
import path from 'path'
import { loadYml } from 'query-builder/lib/utils/loadYml'
import errorHandler from '@/middleware/default/errorHandler'
import analyticsRoutes from '~/routes/analyticsRoutes'

const app = express()
app.use(analyticsRoutes)
app.use(errorHandler)

const client = request(app)

const { searchModifiers, searchOperators } = loadYml(
  path.resolve('config', 'search_conditions')
)

describe('Get analytics endpoint', () => {
  const country = 'us'
  const shipmentType = 'import'

  afterAll(done => request.close(done))

  // there are times that jest failed because of async
  beforeEach(() => {
    jest.setTimeout(5000)
  })

  async function makeSuccessfulRequestShorter() {
    const correctUrl =
      `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
      `?keyword[]=apple,and,${
        searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
      },Consignee&` +
      `misc=BlankConsigneesExcluded&` +
      `arrivalDates=1534867200-1536192000&` +
      `page=1&limit=5&sortBy=-containers_count`
    return await client.get(correctUrl)
  }

  async function makeSuccessfulRequest() {
    const correctUrl =
      `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
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
      `page=1&limit=5&sortBy=-shipments_count`
    return await client.get(correctUrl)
  }

  describe('Successful request', () => {
    beforeEach(() => {
      jest.setTimeout(6000)
    })

    it('Successful request should return status code 200 single keyword', async () => {
      const { status, body } = await makeSuccessfulRequestShorter()
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Successful request should return status code 200', async () => {
      const { status, body } = await makeSuccessfulRequest()
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('should run without the sortBy', async () => {
      const correctUrl =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
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
        `page=1&limit=5`

      const { status } = await client.get(correctUrl)

      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('should run without the misc', async () => {
      const correctUrl =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
        `?keyword[]=apple,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee&` +
        `include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1`

      const { status } = await client.get(correctUrl)

      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('should run without the keyword', async () => {
      const correctUrl =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
        `?include[]=CA,ConsigneeState&` +
        `include[]=WA,ConsigneeState&` +
        `exclude[]=IRVINE,ConsigneeCity&` +
        `misc=BlankConsigneesExcluded&` +
        `arrivalDates=1534867200-1536192000&` +
        `page=1`

      const { status } = await client.get(correctUrl)

      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('should run without the limit', async () => {
      const correctUrl =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
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
        `page=1`

      const { status } = await client.get(correctUrl)

      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })
  })

  describe('unsuccessful request', () => {
    beforeEach(() => {
      jest.setTimeout(6000)
    })

    it('should validate inside of the keywords (operator) is empty', async () => {
      const url =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
        `?keyword[]=apple,,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee`
      const {
        status,
        body: { reason = null }
      } = await client.get(url)
      expect(status).toEqual(400)
      expect(reason).not.toBeNull()
    })

    it('should validate inside of the keywords (operator) is not a valid operator', async () => {
      const url =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
        `?keyword[]=apple,adn1,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee`
      const {
        status,
        body: { reason = null }
      } = await client.get(url)
      expect(status).toEqual(400)
      expect(reason).not.toBeNull()
    })

    it('should validate inside of the keywords (modifier) is empty', async () => {
      const url =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
        `?keyword[]=apple,and,,Consignee` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee`
      const {
        status,
        body: { reason = null }
      } = await client.get(url)
      expect(status).toEqual(400)
      expect(reason).not.toBeNull()
    })

    it('should validate inside of the keywords (modifier) is not a valid field', async () => {
      const url =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
        `?keyword[]=apple,and,random,Consignee` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee`
      const {
        status,
        body: { reason = null }
      } = await client.get(url)
      expect(status).toEqual(400)
      expect(reason).not.toBeNull()
    })

    it('should validate inside of the keywords (field) is not a valid field', async () => {
      const url =
        `/v2/${country}/${shipmentType}/shipments/analytics/consignees` +
        `?keyword[]=apple,and,regular,Consignee1` +
        `keyword[]=banana,and,${
          searchModifiers[Math.floor(Math.random() * searchModifiers.length)]
        },Consignee`
      const {
        status,
        body: { reason = null }
      } = await client.get(url)
      expect(status).toEqual(400)
      expect(reason).not.toBeNull()
    })

    it('should return an error (analyzedField) ', async () => {
      const url =
        `/v2/${country}/${shipmentType}/shipments/analytics/noMappingField` +
        `?arrivalDates=1534867200-1536192000&limit=65`

      const {
        status,
        body: { reason = null }
      } = await client.get(url)
      expect(status).toEqual(400)
      expect(reason).not.toBeNull()
    })
  })
})
