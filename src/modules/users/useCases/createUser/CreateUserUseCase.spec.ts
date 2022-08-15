import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to create a new user', async () => {
    const user = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password',
    }

    const createdUser = await createUserUseCase.execute(user);

    expect(createdUser).toHaveProperty('id')
  })
  it('should be able to create a new user', () => {
    expect(async () => {
      const user = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'password',
      }

      await createUserUseCase.execute(user);

      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})
