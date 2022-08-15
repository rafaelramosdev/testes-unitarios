import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe('Create Statement Controller', () => {
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

  it("should be able to create a deposit statement", async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'john@doe.com',
      password: 'password',
    })

    const { token } = tokenResponse.body

    const depositStatementResponse = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'deposit statement test'
    }).set({
      Authorization: `Bearer ${token}`,
    })

    expect(depositStatementResponse.status).toBe(201)
    expect(depositStatementResponse.body).toHaveProperty('id')
    expect(depositStatementResponse.body.type).toBe('deposit')
  })

  it("should be able to create a withdraw", async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'john@doe.com',
      password: 'password',
    })

    const { token } = tokenResponse.body

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'deposit statement test'
    }).set({
      Authorization: `Bearer ${token}`,
    })

    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 50,
      description: 'withdraw statement test'
    }).set({
      Authorization: `Bearer ${token}`,
    })

    expect(withdrawResponse.status).toBe(201);
    expect(withdrawResponse.body).toHaveProperty('id');
    expect(withdrawResponse.body.type).toBe('withdraw');
  })

  it("should not be able to create a withdraw when the user has insufficient funds", async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'john@doe.com',
      password: 'password',
    })

    const { token } = tokenResponse.body

    const withdrawResponse = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 300,
      description: 'withdraw statement test'
    }).set({
      Authorization: `Bearer ${token}`,
    })

    expect(withdrawResponse.status).toBe(400);
  })
})
