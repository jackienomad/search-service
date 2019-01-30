import request from 'supertest'
import express from 'express'
import errorHandler from '@/middleware/default/errorHandler'
import suggestedRoutes from '~/routes/suggestedRoutes'

const app = express()
app.use(suggestedRoutes)
app.use(errorHandler)

const client = request(app)

describe('Get suggested keywords endpoint', () => {
  const country = 'us'
  const shipmentType = 'import'
  const keyword = 'apple'
  const fields = ['MarksAndNumbers', 'Shipper']
  const joinedFields = fields.join(',')
  const arrivalDates = '1514764800-1538352000'

  async function makeUnsuccessfulRequest() {
    const incorrectFields = ['IncorrectField1', 'IncorrectField2']
    const incorrectUrl =
      `/v2/${country}/${shipmentType}/shipments/suggested/keywords` +
      `?keyword=${keyword}&fields=${incorrectFields}` +
      `&arrivalDates=${arrivalDates}`
    return await client.get(incorrectUrl)
  }

  async function makeSuccessfulRequest() {
    const correctUrl =
      `/v2/${country}/${shipmentType}/shipments/suggested/keywords` +
      `?keyword=${keyword}&fields=${joinedFields}` +
      `&arrivalDates=${arrivalDates}`
    return await client.get(correctUrl)
  }

  describe('Successful requests', () => {
    it('Successful request should return status code 200', async () => {
      const { status } = await makeSuccessfulRequest()
      expect(+status).toBeGreaterThanOrEqual(200)
      expect(+status).toBeLessThan(300)
    })

    it('Successful request should have a success value of true', async () => {
      const {
        body: { success }
      } = await makeSuccessfulRequest()
      expect(success).toStrictEqual(true)
    })

    it('Successful request should have proper data structure', async () => {
      const {
        body: { data }
      } = await makeSuccessfulRequest()
      expect(Object.keys(data)).toEqual(fields)
    })
  })

  describe('Unsuccessful requests', async () => {
    it('Unsuccessful request should return status code 400', async () => {
      const { status } = await makeUnsuccessfulRequest()
      expect(+status).toBeGreaterThanOrEqual(400)
      expect(+status).toBeLessThan(500)
    })

    it('Unsuccessful request should have a success of false', async () => {
      const { body: data } = await makeUnsuccessfulRequest()
      expect(data.success).toStrictEqual(false)
    })

    it('Unsuccessful request should have a reason', async () => {
      const { body: data } = await makeUnsuccessfulRequest()
      expect(data.reason).not.toBeUndefined()
    })
  })
})
