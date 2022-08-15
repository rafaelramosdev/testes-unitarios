import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Create Statement Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a deposit statement", async () => {
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

    const statement = {
      user_id: token.user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'deposit statement test'
    }

    const createdDepositStatement = await createStatementUseCase.execute(statement);

    expect(createdDepositStatement).toHaveProperty("id")
    expect(createdDepositStatement.amount).toEqual(100)

  })

  it("should be able to create a withdraw", async () => {
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

    await createStatementUseCase.execute(statement);

    const withdraw = {
      user_id: token.user.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'withdraw statement test'
    }

    const createdWithdrawStatement = await createStatementUseCase.execute(withdraw)

    expect(createdWithdrawStatement).toHaveProperty('id')
  })

  it("should not be able to create a withdraw when the user has insufficient funds", () => {
    expect(async () => {
      const user = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'password',
      }

      await createUserUseCase.execute(user);

      const token = await authenticateUserUseCase.execute(user);

      const withdraw = {
        user_id: token.user.id as string,
        type: OperationType.WITHDRAW,
        amount: 50,
        description: 'withdraw statement test'
      }

      await createStatementUseCase.execute(withdraw)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it("should not be able to create a statement for a nonexistent user", () => {
    expect(async () => {
      const statement = {
        user_id: 'nonexistent user',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'deposit statement test'
      }

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })
})
