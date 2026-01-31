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
});
