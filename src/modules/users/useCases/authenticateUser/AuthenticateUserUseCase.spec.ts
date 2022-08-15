import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate User Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to authenticate an user", async () => {
    const user = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password',
    }

    await createUserUseCase.execute(user);

    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })

    expect(token).toHaveProperty('token')
    expect(token).toHaveProperty('user')
  })

  it("should not be able to authenticate a nonexistent user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'nonexistent email',
        password: 'nonexistent password'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate a user with incorrect password", () => {
    expect(async () => {
      const user = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'password',
      }

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrect password'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
