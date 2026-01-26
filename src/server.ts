import Fastify from 'fastify'

const app = Fastify()

app.get('/', async () => {
  return { hello: 'world' }
})

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Server running')
})
