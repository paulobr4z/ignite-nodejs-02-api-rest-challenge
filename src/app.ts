import fastify from "fastify"
import { usersRoutes } from "./routes/users.routes.js"
import { mealsRoutes } from "./routes/meals.routes.js"

export const app = fastify()

app.register(usersRoutes, {
  prefix: "users"
})

app.register(mealsRoutes, {
  prefix: "meals"
})