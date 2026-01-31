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

  app.put(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        id: z.uuid(),
      });

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      });

      const { id } = updateMealParamsSchema.parse(request.params);

      const { name, description, isOnDiet, date } = updateMealBodySchema.parse(
        request.body,
      );

      const meal = await db("meals")
        .where({
          id,
          user_id: request.user.id,
        })
        .first();

      if (!meal) {
        return reply.status(404).send({ message: "Meal not found." });
      }

      await db("meals").where({ id }).update({
        name,
        description,
        is_on_diet: isOnDiet,
        date,
      });

      return reply.status(200).send();
    },
  );
}
