import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

interface IMeals {
  id: string;
  userId: string;
  name: string;
  description: string;
  date: string;
  isOnDiet: boolean;
  createdAt: string;
}

const meals: IMeals[] = []

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', () => {
    return { meals }
  })

  app.post('/', (request, reply) => {
    const createMealBodySchema = z.object({
      userId: z.string(),
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
    })

    const { userId, name, description, isOnDiet } =
      createMealBodySchema.parse(request.body)

    const newMeal = {
      id: crypto.randomUUID(),
      userId,
      name,
      description,
      date: Date(),
      isOnDiet,
      createdAt: Date(),
    }

    meals.push(newMeal)

    return reply.status(201).send()
  })
}
