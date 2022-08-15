import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from 'uuid';
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe('Get Statement Operation Controller', () => {
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

  it('should be able to get a statement operation', async () => {
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

    const statementOperationResponse = await request(app).get(`/api/v1/statements/${depositStatementResponse.body.id}`).set({
      Authorization: `Bearer ${token}`,
    });

    expect(statementOperationResponse.status).toBe(200);
  })

  it("should not be able to get a nonexistent statement operation", async () => {
    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'john@doe.com',
      password: 'password',
    })

    const { token } = tokenResponse.body

    const statementOperationResponse = await request(app).get(`/api/v1/statements/${uuid()}`)
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(statementOperationResponse.status).toBe(404);
  })
})
