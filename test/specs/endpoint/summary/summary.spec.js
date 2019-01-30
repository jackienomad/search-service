import request from 'supertest'
import express from 'express'
import errorHandler from '@/middleware/default/errorHandler'
import summaryRoutes from '~/routes/summaryRoutes'

const app = express()
app.use(summaryRoutes)
app.use(errorHandler)

const client = request(app)

function makeRequest(paramsObject) {
  // extract and assign defaults
  const {
    country = 'us',
    shipmentType = 'import',
    scale = 'weeks',
    timezone = 'Asia/Manila',
    keywords = ['apple,and,fuzzy,Consignee', 'orange,or,fuzzy,Consignee'],
    misc = 'BlankConsigneesExcluded',
    arrivalDates = '1534867200-1536192000',
    includes = ['CA,ConsigneeState', 'WA,ConsigneeState'],
    excludes = ['IRVINE,ConsigneeCity']
  } = paramsObject || {}

  // build url
  const url =
    `/v1/${country}/${shipmentType}/shipments/summary?` +
    ((keywords &&
      keywords.length &&
      '&' + keywords.map(keyword => `keyword[]=` + keyword).join('&')) ||
      '') +
    `&misc=${misc}&arrivalDates=${arrivalDates}` +
    ((includes &&
      includes.length &&
      '&' + includes.map(include => `include[]=${include}`).join('&')) ||
      '') +
    ((excludes &&
      excludes.length &&
      '&' + excludes.map(exclude => `exclude[]=${exclude}`).join('&')) ||
      '') +
    `&scale=${scale}&timezone=${timezone}`
  return client.get(url)
}

const makeSuccessfulRequest = makeRequest

function makeFailingRequest() {
  return makeRequest({
    arrivalDates: ''
  })
}

describe('Shipment summary endpoint', () => {
  afterAll(done => request.close(done))

  beforeEach(() => {
    jest.setTimeout(5000)
  })

  describe('Successful requests', () => {
    it('should have status code 2xx', async () => {
      const { status } = await makeSuccessfulRequest()
      expect(status).toBeGreaterThanOrEqual(200)
      expect(status).toBeLessThan(300)
    })

    it('should have success value of true', async () => {
      const {
        body: { success }
      } = await makeSuccessfulRequest()
      expect(success).toBe(true)
    })
  })

  describe('Failed requests', () => {
    it('should have status code >=400', async () => {
      const { status } = await makeFailingRequest()
      expect(status).toBeGreaterThanOrEqual(400)
      expect(status).toBeLessThan(600)
    })

    it('should have success value of false', async () => {
      const {
        body: { success }
      } = await makeFailingRequest()
      expect(success).toBe(false)
    })

    it('should have a reason', async () => {
      const {
        body: { reason = null }
      } = await makeFailingRequest()
      expect(reason).not.toBeNull()
    })
  })

  describe('Search Parameters', () => {
    describe('scale', () => {
      it('should still succeed on missing scale', async () => {
        const {
          status,
          body: { success }
        } = await makeRequest({ scale: '' })
        expect(status).toBe(200)
        expect(success).toBe(true)
      })

      it('should fail on invalid scale', async () => {
        const {
          status,
          body: { success, reason = null }
        } = await makeRequest({ scale: 'InvalidScale' })
        expect(status).toBe(400)
        expect(success).toBe(false)
        expect(reason).not.toBeNull()
      })
    })

    describe('timezone', () => {
      it('should still succeed on missing timezone', async () => {
        const {
          status,
          body: { success }
        } = await makeRequest({ timezone: '' })
        expect(status).toBe(200)
        expect(success).toBe(true)
      })

      it('should fail on invalid timezone', async () => {
        const {
          status,
          body: { success, reason = null }
        } = await makeRequest({ timezone: 'InvalidTimezone' })
        expect(status).toBe(400)
        expect(success).toBe(false)
        expect(reason).not.toBeNull()
      })
    })

    describe('keywords', () => {
      it('should still succeed on missing keywords', async () => {
        const {
          status,
          body: { success }
        } = await makeRequest({ keywords: [] })
        expect(status).toBe(200)
        expect(success).toBe(true)
      })
    })

    describe('misc', () => {
      it('should still succeed on missing misc', async () => {
        const {
          status,
          body: { success }
        } = await makeRequest({ misc: '' })
        expect(status).toBe(200)
        expect(success).toBe(true)
      })

      it('should fail on invalid misc', async () => {
        const {
          status,
          body: { success, reason = null }
        } = await makeRequest({ misc: 'InvalidMisc' })
        expect(status).toBe(400)
        expect(success).toBe(false)
        expect(reason).not.toBeNull()
      })
    })

    describe('arrivalDates', () => {
      it('should fail on invalid arrivalDates', async () => {
        const {
          status,
          body: { success, reason = null }
        } = await makeRequest({ arrivalDates: 'InvalidArrivalDates' })
        expect(status).toBe(400)
        expect(success).toBe(false)
        expect(reason).not.toBeNull()
      })
    })

    describe('include', () => {
      it('should still succeed on missing include', async () => {
        const {
          status,
          body: { success }
        } = await makeRequest({ include: [] })
        expect(status).toBe(200)
        expect(success).toBe(true)
      })
    })

    describe('exclude', () => {
      it('should still succeed on missing exclude', async () => {
        const {
          status,
          body: { success }
        } = await makeRequest({ exclude: [] })
        expect(status).toBe(200)
        expect(success).toBe(true)
      })
    })
  })
})
