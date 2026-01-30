import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      name: string
      email: string
      session_id: string
    }
  }
}
