import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase} from './ShowUserProfileUseCase'

let inMemoryUsersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Show User Profile Use Case', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })

  it('should be able to show the user profile', async () => {
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

    const userProfile = await showUserProfileUseCase.execute(token.user.id as string)

    expect(userProfile).toHaveProperty('id')
  })

  it("should not be able to show a profile of a nonexistent user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute('nonexistent user')
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
