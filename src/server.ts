import fastify from 'fastify'
import { knex } from './database'

const app = fastify()

app.get('/', async (_, __) => {
  const tables = await knex('sqlite_schema').select('*')
  return { tables }
})

app.listen({ port: 3000 }, (_, address) => {
  console.log(`Server listening at ${address}`)
})
