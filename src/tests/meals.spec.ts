import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../app.js";
import { db } from "../database.js";

describe.sequential("Meals routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await db("meals").del();
    await db("users").del();
  });

  it("Deve ser possível registrar uma refeição", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Salada",
        description: "Alface, tomate, pepino",
        isOnDiet: true,
        date: new Date().toISOString(),
      })
      .expect(201);
  });

  it("Deve ser possível editar uma refeição, podendo alterar todos os dados", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Salada",
      description: "Alface, tomate, pepino",
      isOnDiet: true,
      date: new Date().toISOString(),
    });

    const mealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .send({
        name: "Salada2",
        description: "Alface, tomate, pepino",
        isOnDiet: true,
        date: new Date().toISOString(),
      })
      .expect(200);
  });

  it("Não deve permitir editar uma refeição inexistente", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    const fakeMealId = crypto.randomUUID();

    await request(app.server)
      .put(`/meals/${fakeMealId}`)
      .set("Cookie", cookies)
      .send({
        name: "Salada",
        description: "Alface, tomate, pepino",
        isOnDiet: true,
        date: new Date().toISOString(),
      })
      .expect(404)
      .expect((response) => {
        expect(response.body.message).toBe("Meal not found.");
      });
  });

  it("Deve ser possível apagar uma refeição", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Salada",
      description: "Alface, tomate, pepino",
      isOnDiet: true,
      date: new Date().toISOString(),
    });

    const mealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(204);
  });

  it("Não deve permitir deletar uma refeição inexistente", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    const fakeMealId = crypto.randomUUID();

    await request(app.server)
      .delete(`/meals/${fakeMealId}`)
      .set("Cookie", cookies)
      .expect(404)
      .expect((response) => {
        expect(response.body.message).toBe("Meal not found.");
      });
  });

  it("Deve ser possível listar todas as refeições de um usuário", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Salada",
      description: "Alface, tomate, pepino",
      isOnDiet: true,
      date: new Date().toISOString(),
    });

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: "Salada",
        description: "Alface, tomate, pepino",
        is_on_diet: 1,
      }),
    ]);
  });

  it("Deve ser possível visualizar uma única refeição", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Salada",
      description: "Alface, tomate, pepino",
      isOnDiet: true,
      date: new Date().toISOString(),
    });

    const mealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = mealsResponse.body.meals[0].id;

    const listMealsResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body).toEqual(
      expect.objectContaining({
        name: "Salada",
        description: "Alface, tomate, pepino",
        is_on_diet: 1,
      }),
    );
  });

  it("Deve ser possível recuperar as métricas de um usuário", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Salada",
      description: "Alface, tomate, pepino",
      isOnDiet: true,
      date: new Date().toISOString(),
    });

    const mealsMetricsResponse = await request(app.server)
      .get("/meals/metrics")
      .set("Cookie", cookies)
      .expect(200);

    expect(mealsMetricsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 1,
        mealsOnDiet: 1,
        mealsOffDiet: 0,
        bestOnDietSequence: 1,
      }),
    );
  });

  it("Deve quebrar a sequência quando houver uma refeição fora da dieta", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    const cookies = createUserResponse.get("Set-Cookie") || [];

    const baseDate = new Date();

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Refeição 1",
        description: "OK",
        isOnDiet: true,
        date: new Date(baseDate.getTime() + 1000).toISOString(),
      });

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Refeição 2",
        description: "OK",
        isOnDiet: true,
        date: new Date(baseDate.getTime() + 2000).toISOString(),
      });

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Refeição 3",
        description: "Fora da dieta",
        isOnDiet: false,
        date: new Date(baseDate.getTime() + 3000).toISOString(),
      });

    await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Refeição 4",
        description: "OK",
        isOnDiet: true,
        date: new Date(baseDate.getTime() + 4000).toISOString(),
      });

    const metricsResponse = await request(app.server)
      .get("/meals/metrics")
      .set("Cookie", cookies)
      .expect(200);

    expect(metricsResponse.body.bestOnDietSequence).toBe(2);
  });
});
