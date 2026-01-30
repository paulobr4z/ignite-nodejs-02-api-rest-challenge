import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../database.js'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meals = await db('meals').select('*')

    return { meals }
  })

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      userId: z.string(),
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
    })

    const { userId, name, description, isOnDiet } =
      createMealBodySchema.parse(request.body)

    await db('meals').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      description,
      is_on_diet: isOnDiet,
    })

    return reply.status(201).send()
  })
}
