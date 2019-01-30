import request from 'supertest'
import express from 'express'
import errorHandler from '@/middleware/default/errorHandler'
import companyRoutes from '~/routes/companyRoutes'

const app = express()
app.use(companyRoutes)
app.use(errorHandler)

const client = request(app)

describe('Company shipments endpoint', () => {
  const sample = {
    country: 'us',
    shipmentType: 'import',
    arrivalDates: '1534924800-1536192000',
    timezone: 'Asia/Manila',
    interval: 'weeks',
    size: 0
  }

  const defaults = {
    timezone: 'Asia/Manila',
    interval: 'weeks',
    size: 0,
    traderTypes: ['internal']
  }

  function makeRequest(paramsObject = {}) {
    const {
      country = 'us',
      shipmentType = 'import',
      arrivalDates = '1534924800-1536192000',
      companyId = '28a79d28abfe3f78fed5f541e9e28a6d',
      timezone = defaults.timezone,
      interval = defaults.interval,
      size = defaults.size,
      traderTypes = defaults.traderTypes
    } = paramsObject
    const url =
      `/v2/${country}/${shipmentType}/companies/${companyId}/shipments?` +
      (arrivalDates !== null ? `arrivalDates=${arrivalDates}` : '') +
      (timezone !== null ? `&timezone=${timezone}` : '') +
      (interval !== null ? `&interval=${interval}` : '') +
      (size !== null ? `&size=${size}` : '') +
      (traderTypes !== null ? `&traderTypes=${traderTypes}` : '')
    return client.get(url)
  }

  function makeUnsuccessfulRequest() {
    return makeRequest({ country: 'wrongCountry' })
  }
  const makeSuccessfulRequest = makeRequest

  describe('Successful requests', () => {
    it('Successful request should return status code 200', async () => {
      const { status } = await makeSuccessfulRequest()
      expect(+status).toBe(200)
    })

    it('Successful request should have a success value of true', async () => {
      const {
        body: { success }
      } = await makeSuccessfulRequest()
      expect(success).toStrictEqual(true)
    })

    it('Successful request should include passed parameters', async () => {
      const {
        body: {
          country: rCountry,
          shipmentType: rShipmentType,
          traderTypes: rTraderTypes,
          arrivalDates: rArrivalDates,
          interval: rInterval,
          timezone: rTimezone,
          size: rSize
        }
      } = await makeSuccessfulRequest()

      const [start, end] = sample.arrivalDates.split('-')
      expect(rCountry).toEqual(sample.country)
      expect(rShipmentType).toEqual(sample.shipmentType)
      expect(rTraderTypes).toEqual(defaults.traderTypes)
      expect(rArrivalDates).toEqual([
        {
          start: +start,
          end: +end
        }
      ])
      expect(rInterval).toEqual(sample.interval)
      expect(rTimezone).toEqual(sample.timezone)
      expect(rSize).toEqual(sample.size)
    })

    it('Successful request should return an array for data', async () => {
      const {
        body: { data }
      } = await makeSuccessfulRequest()
      expect(data instanceof Array).toBeTruthy()
    })
  })

  describe('Unsuccessful requests', () => {
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

  describe('Special cases', () => {
    describe('URL parameters', () => {
      it('Incorrect country should fail ', async () => {
        const {
          status,
          body: { success, reason = undefined }
        } = await makeRequest({ country: 'wrongCountry' })

        expect(status).toBeGreaterThanOrEqual(400)
        expect(status).toBeLessThan(500)
        expect(success).toBe(false)
        expect(reason).toBeDefined()
      })

      it('Incorrect shipmentType should fail ', async () => {
        const {
          status,
          body: { success, reason = undefined }
        } = await makeRequest({ shipmentType: 'wrongShipmentType' })

        expect(status).toBeGreaterThanOrEqual(400)
        expect(status).toBeLessThan(500)
        expect(success).toBe(false)
        expect(reason).toBeDefined()
      })
    })

    describe('Parameters', () => {
      describe('arrivalDates', () => {
        it('Missing arrivalDates should fail ', async () => {
          const {
            status,
            body: { success, reason = undefined }
          } = await makeRequest({ arrivalDates: null })

          expect(status).toBe(400)
          expect(success).toBe(false)
          expect(reason).toBeDefined()
        })

        it('Blank arrivalDates should fail ', async () => {
          const {
            status,
            body: { success, reason = undefined }
          } = await makeRequest({ arrivalDates: '' })

          expect(status).toBe(400)
          expect(success).toBe(false)
          expect(reason).toBeDefined()
        })

        it('Invalid arrivalDates should fail ', async () => {
          const {
            status,
            body: { success, reason = undefined }
          } = await makeRequest({ arrivalDates: 'invalidArrivalDates' })

          expect(status).toBe(400)
          expect(success).toBe(false)
          expect(reason).toBeDefined()
        })
      })

      describe('timezone', () => {
        it('Missing timezone should return a default timezone', async () => {
          const {
            status,
            body: { success, timezone }
          } = await makeRequest({ timezone: null })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(timezone).toBe(defaults.timezone)
        })

        it('Blank timezone should return a default timezone', async () => {
          const {
            status,
            body: { success, timezone }
          } = await makeRequest({ timezone: '' })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(timezone).toBe(defaults.timezone)
        })

        it('Invalid timezone should fail', async () => {
          const {
            status,
            body: { success, reason = undefined }
          } = await makeRequest({ timezone: 'invalidTimezone' })

          expect(status).toBe(400)
          expect(success).toBe(false)
          expect(reason).toBeDefined()
        })
      })

      describe('interval', () => {
        it('Missing interval should return weeks as default', async () => {
          const {
            status,
            body: { success, interval }
          } = await makeRequest({ interval: null })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(interval).toBe(defaults.interval)
        })

        it('Blank interval should return weeks as default', async () => {
          const {
            status,
            body: { success, interval }
          } = await makeRequest({ interval: '' })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(interval).toBe(defaults.interval)
        })

        it('Invalid interval should fail', async () => {
          const {
            status,
            body: { success, reason = undefined }
          } = await makeRequest({ interval: 'invalidInterval' })

          expect(status).toBe(400)
          expect(success).toBe(false)
          expect(reason).toBeDefined()
        })
      })

      describe('size', () => {
        it('Missing size should return 0 as default', async () => {
          const {
            status,
            body: { success, size }
          } = await makeRequest({ size: null })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(size).toBe(defaults.size)
        })

        it('Blank size should return 0 as default', async () => {
          const {
            status,
            body: { success, size }
          } = await makeRequest({ size: '' })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(size).toBe(defaults.size)
        })

        it('Invalid size should fail', async () => {
          const {
            status,
            body: { success, reason = undefined }
          } = await makeRequest({ size: 'invalidSize' })

          expect(status).toBe(400)
          expect(success).toBe(false)
          expect(reason).toBeDefined()
        })
      })

      describe('traderTypes', () => {
        it(`Missing traderTypes should return default`, async () => {
          const {
            status,
            body: { success, traderTypes }
          } = await makeRequest({ traderTypes: null })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(traderTypes).toEqual(defaults.traderTypes)
        })

        it(`Blank traderTypes should return default`, async () => {
          const {
            status,
            body: { success, traderTypes }
          } = await makeRequest({ traderTypes: '' })

          expect(status).toBe(200)
          expect(success).toBe(true)
          expect(traderTypes).toEqual(defaults.traderTypes)
        })

        it(`Invalid traderTypes should fail`, async () => {
          const {
            status,
            body: { success, reason = undefined }
          } = await makeRequest({ traderTypes: 'invalidTraderTypes' })

          expect(status).toBe(400)
          expect(success).toBe(false)
          expect(reason).toBeDefined()
        })
      })
    })
  })
})
