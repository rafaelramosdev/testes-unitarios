import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Get Balance Use Case', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it('should be able to get the balance', async () => {
    const user = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password',
    }

    await createUserUseCase.execute(user);

    const token = await authenticateUserUseCase.execute(user);

    const statement = {
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit statement test'
    }

    await createStatementUseCase.execute(statement)

    const balance = await getBalanceUseCase.execute({ user_id: token.user.id as string });

    expect(balance).toHaveProperty('balance')
    expect(balance.balance).toEqual(100)
  })

  it("should not be able to get the balance from a nonexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: 'nonexistent user' });
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
