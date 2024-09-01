import fastify from 'fastify'

import { env } from './env'

import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(transactionsRoutes, { prefix: '/transactions' })

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`Server listening on http://localhost:${env.PORT}`)
});