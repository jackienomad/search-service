import { createServer } from '~/servers/createServer'

const PORT = process.env.PORT || 3000

// eslint-disable-next-line
createServer(() => console.log(`Server is now listening at port ${PORT}`))
