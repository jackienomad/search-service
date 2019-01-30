import request from 'supertest'
import express from 'express'
import errorHandler from '@/middleware/default/errorHandler'
import suggestedRoutes from '~/routes/suggestedRoutes'

const app = express()
app.use(suggestedRoutes)
app.use(errorHandler)

const client = request(app)

describe('Get suggested fields endpoint', () => {
  const country = 'us'
  const shipmentType = 'import'
  const keyword = 'apple'
  const arrivalDates = '1514764800-1538352000'

  async function makeUnsuccessfulRequest() {
    const blankKeyword = ''
    const incorrectUrl =
      `/v2/${country}/${shipmentType}/shipments/suggested/fields` +
      `?keyword=${blankKeyword}&arrivalDates=${arrivalDates}`
    return await client.get(incorrectUrl)
  }

  async function makeSuccessfulRequest() {
    const incorrectUrl =
      `/v2/${country}/${shipmentType}/shipments/suggested/fields` +
      `?keyword=${keyword}&arrivalDates=${arrivalDates}`
    return await client.get(incorrectUrl)
  }

  describe('Successful requests', () => {
    beforeEach(() => {
      jest.setTimeout(5000)
    })
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
      expect(data instanceof Array).toBeTruthy()
    })
  })

  describe('Unsuccessful requests', () => {
    beforeEach(() => {
      jest.setTimeout(5000)
    })
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
