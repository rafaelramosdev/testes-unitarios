import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Get Statement Operation Use Case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  })

  it('should be able to get a statement operation', async () => {
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

    const statementOperation = await getStatementOperationUseCase.execute({ user_id: token.user.id as string, statement_id: createdDepositStatement.id as string})

    expect(statementOperation).toHaveProperty('id')
  })

  it("should not be able to get a statement operation for a nonexistent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: 'nonexistent user', statement_id: 'nonexistent statement' })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get a nonexistent statement operation", () => {
    expect(async () => {
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

      await getStatementOperationUseCase.execute({ user_id: token.user.id as string, statement_id: 'nonexistent statement' })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
