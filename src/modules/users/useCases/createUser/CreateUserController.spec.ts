import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create a new user', async () => {
    const userResponse = await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password',
    })

    expect(userResponse.status).toBe(201);
  })

  it('should not be able to create an user with an existent email', async () => {
    const userResponse = await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password',
    })


    expect(userResponse.status).toBe(400);
  })
})
