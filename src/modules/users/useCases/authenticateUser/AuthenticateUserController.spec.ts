import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("password", 8);

    await connection.query(`
      INSERT INTO users
        (id, name, email, password, created_at, updated_at)
      VALUES
        ('${id}', 'John Doe', 'john@doe.com', '${password}', 'now()', 'now()')
    `);
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate an user", async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'john@doe.com',
      password: 'password',
    })

    expect(tokenResponse.status).toBe(200);
    expect(tokenResponse.body).toHaveProperty("token");
  })

  it("should not be able to authenticate a nonexistent user", async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'nonexistent email',
      password: 'nonexistent password',
    })

    expect(tokenResponse.status).toBe(401);
  })

  it("should not be able to authenticate a user with incorrect password", async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'john@doe.com',
      password: 'incorrect password',
    })

    expect(tokenResponse.status).toBe(401);
  })
})
