import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import errorHandler from '@/middleware/default/errorHandler'
import notFound from '@/middleware/default/notFound'
import loadRoutes from '@/utils/loadRoutes'

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())
// app.use(cors)
// load routes
loadRoutes(app)

/**
 *
 * @param {*} done
 * @param {*} injectableRoutes - array of routers to be passed to app.use
 */
export function createServer(done, injectableRoutes) {
  if (injectableRoutes) {
    injectableRoutes.forEach(router => app.use(router))
  }

  app.use(notFound)
  app.use(errorHandler)

  return {
    server: app.listen(PORT, done)
  }
}
