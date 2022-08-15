import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe('Show User Profile Controller', () => {
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

  it('should be able to show the user profile', async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'john@doe.com',
      password: 'password',
    })

    const { token } = tokenResponse.body

    const userProfileResponse = await request(app).post('/api/v1/profile').set({
      Authorization: `Bearer ${token}`,
    })

    expect(userProfileResponse.status).toBe(200);
  })
})
