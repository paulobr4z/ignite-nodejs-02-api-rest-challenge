import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { app } from "../app.js";
import { db } from "../database.js";

describe.sequential("Middlewares: check-session-id-exists", () => {
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

  it("Verifica se o user tem um session ativa", async () => {
    await request(app.server).post("/users").send({
      name: "John Doe",
      email: "email@gmail.com",
    });

    await request(app.server)
      .post("/meals")
      .send({
        name: "Salada",
        description: "Alface, tomate, pepino",
        isOnDiet: true,
        date: new Date().toISOString(),
      })
      .expect(401);
  });

  it("Verifica ser o user tem um session id, mas não está cadastrado", async () => {
    await request(app.server)
      .post("/meals")
      .set("Cookie", "sessionId=df293ea7-4bb5-4d87-a59f-466788195cf3")
      .send({
        name: "Salada",
        description: "Alface, tomate, pepino",
        isOnDiet: true,
        date: new Date().toISOString(),
      })
      .expect(401);
  });
});
