import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../app.js";
import { db } from "../database.js";

describe.sequential("Users routes", () => {
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

  it("Deve criar usuário usando sessionId existente no cookie", async () => {
    const sessionId = crypto.randomUUID();

    const response = await request(app.server)
      .post("/users")
      .set("Cookie", `sessionId=${sessionId}`)
      .send({
        name: "John Doe",
        email: "email2@gmail.com",
      })
      .expect(201);

    expect(response.headers["set-cookie"]).toBeUndefined();

    const userInDb = await db("users")
      .where({ email: "email2@gmail.com" })
      .first();

    expect(userInDb.session_id).toBe(sessionId);
  });

  it("Não deve ser possivel cadastrar e-mail duplicados!", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
        email: "email@gmail.com",
      })
      .expect(201);

    const response = await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
        email: "email@gmail.com",
      })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        message: "User already exists",
      }),
    );
  });
});
