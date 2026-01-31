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

  app.delete(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.uuid(),
      });

      const { id } = deleteMealParamsSchema.parse(request.params);

      const meal = await db("meals")
        .where({
          id,
          user_id: request.user.id,
        })
        .first();

      if (!meal) {
        return reply.status(404).send({ message: "Meal not found." });
      }

      await db("meals").where({ id }).delete();

      return reply.status(204).send();
    },
  );

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = getMealParamsSchema.parse(request.params);

    const meal = await db("meals")
      .where({
        id,
        user_id: request.user.id,
      })
      .first();

    return meal;
  });

  app.get(
    "/metrics",
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const user_id = request.user.id;

      const meals = await db("meals")
        .where("user_id", user_id)
        .orderBy("date", "asc");

      let bestOnDietSequence = 0;
      let currentSequence = 0;

      for (const meal of meals) {
        if (meal.is_on_diet) {
          currentSequence++;
          bestOnDietSequence = Math.max(bestOnDietSequence, currentSequence);
        } else {
          currentSequence = 0;
        }
      }

      return {
        totalMeals: meals.length,
        mealsOnDiet: meals.filter((meal) => meal.is_on_diet).length,
        mealsOffDiet: meals.filter((meal) => !meal.is_on_diet).length,
        bestOnDietSequence,
      };
    },
  );
}
