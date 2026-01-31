import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../database.js";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists.js";

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkSessionIdExists] }, async (request) => {
    const meals = await db("meals").where("user_id", request.user.id).select();

    return { meals };
  });

  app.post(
    "/",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      });

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      );

      await db("meals").insert({
        id: crypto.randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        date,
        user_id: request.user?.id,
      });

      return reply.status(201).send();
    },
  );
}
