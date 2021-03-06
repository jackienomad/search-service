import request from 'supertest'
import express from 'express'
import errorHandler from '@/middleware/default/errorHandler'
import refinementsRoutes from '~/routes/refinementsRoutes'

const app = express()
app.use(refinementsRoutes)
app.use(errorHandler)

const client = request(app)

function makeRequest(paramsObject) {
  // extract and assign defaults
  const {
    country = 'us',
    shipmentType = 'import',
    fields = 'NotifyParty,CountryOfOrigin,ConsigneeStreet,ConsigneeZipCode,ForeignPort,DestinationPort,ConsigneeState,ConsigneeCity,Consignee,Shipper,ShipperAddress,NotifyPartyAddress,MarksAndNumbers',
    keywords = ['apple,and,fuzzy,Consignee', 'banana,or,fuzzy,Consignee'],
    misc = 'BlankConsigneesExcluded',
    arrivalDates = '1473667200-1543449600',
    includes = ['CA,ConsigneeState'],
    excludes = ['WA,ConsigneeState']
  } = paramsObject || {}

  // build url
  const url =
    `/v2/${country}/${shipmentType}/shipments/search/refinements?fields=${fields}` +
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
      '')
  return client.get(url)
}

// alias for readability
const makeSuccessfulRequest = makeRequest

function makeFailingRequest() {
  return makeRequest({
    fields: ''
  })
}

describe('Search refinements endpoint', () => {
  afterAll(done => request.close(done))

  // Increast test timeout
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

    it('should have correct structure', () => {})
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

  describe('Parameters', () => {
    describe('fields', () => {
      it('should fail on missing fields', async () => {
        const {
          status,
          body: { success, reason = null }
        } = await makeRequest({ fields: '' })
        expect(status).toBe(400)
        expect(success).toBe(false)
        expect(reason).not.toBeNull()
      })

      it('should fail on invalid fields', async () => {
        const {
          status,
          body: { success, reason = null }
        } = await makeRequest({ fields: 'InvalidField' })
        expect(status).toBe(400)
        expect(success).toBe(false)
        expect(reason).not.toBeNull()
      })

      it('should support misc fields', async () => {
        const fields =
          'BlankConsigneesExcluded,BlankShippersExcluded,MasterShipmentsExcluded,HouseShipmentsOnly,MasterShipmentsOnly'
        const {
          status,
          body: { success, data }
        } = await makeRequest({
          fields
        })
        expect(status).toBe(200)
        expect(success).toBe(true)

        const fieldsArray = fields.split(',')

        const returnedFields = data.map(({ field }) => field)
        const nonMiscellaneous = data.filter(
          ({ category }) => category !== 'Miscellaneous'
        )
        expect(returnedFields.sort()).toEqual(fieldsArray.sort())
        expect(nonMiscellaneous).toEqual([])
      })

      it('should support All fields', async () => {
        const {
          status,
          body: { success }
        } = await makeRequest({ fields: 'All' })
        expect(status).toBe(200)
        expect(success).toBe(true)
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

  describe('Regression tests', () => {
    it('should handle comma in keywords properly', async () => {
      const {
        status,
        body: { success, reason = null }
      } = await makeRequest({ keywords: ['apple, juice,and,fuzzy,Consignee'] })
      expect(status).toBe(200)
      expect(success).toBe(true)
    })
  })
})
