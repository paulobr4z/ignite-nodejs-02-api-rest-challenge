import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
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

  it("Deve ser possível criar um usuário", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "John Doe",
        email: "email@gmail.com",
      })
      .expect(201);
  });
});
