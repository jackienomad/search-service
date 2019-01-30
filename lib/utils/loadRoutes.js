import fs from 'fs'
import path from 'path'

export function loadRoutes(app, routesPath = null) {
  // load routes
  const routesDirectory = routesPath || path.resolve('src', 'routes')
  const files = fs
    .readdirSync(routesDirectory)
    .filter(filename => /^.*\.js$/.test(filename))
  files.forEach(filename => {
    const router = require(`${routesDirectory}/${filename}`)
    app.use(router)
  })
}

export default loadRoutes
