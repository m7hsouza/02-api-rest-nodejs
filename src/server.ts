import fastify from 'fastify'

const app = fastify()

app.get('/', async (_, __) => {
  return { hello: 'world' }
})

app.listen({ port: 3000 }, (_, address) => {
  console.log(`Server listening at ${address}`)
})
