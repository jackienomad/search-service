import elasticsearch from 'elasticsearch'

// create es client
if (!process.env.ES_HOST) throw new Error('Elasticsearch host is not defined')
export const client = new elasticsearch.Client({
  host: process.env.ES_HOST,
  apiVersion: process.env.ES_VERSION
})
export default client
