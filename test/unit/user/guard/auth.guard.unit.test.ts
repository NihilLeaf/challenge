import { Test, TestingModule } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { AuthGuard } from 'src/user/guard'
import { AuthService } from 'src/user/service'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { User } from 'src/user/entity'

@suite
export class AuthGuardUnitTest {
  private authGuard: AuthGuard
  private authService: AuthService

  async before() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn(),
          },
        },
      ],
    }).compile()

    this.authGuard = module.get<AuthGuard>(AuthGuard)
    this.authService = module.get<AuthService>(AuthService)
  }

  private createMockContext(): ExecutionContext {
    return {
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext
  }

  private createGqlExecutionContext(authHeader?: string): GqlExecutionContext {
    return {
      getContext: jest.fn().mockReturnValue({
        req: {
          headers: { authorization: authHeader },
        },
      }),
    } as unknown as GqlExecutionContext
  }

  @test
  async '[canActivate] Should allow access with valid token'() {
    const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000', name: 'John Doe' } as User // Updated to valid UUID
    jest.spyOn(this.authService, 'validateToken').mockResolvedValue(mockUser)

    const mockContext = this.createMockContext()
    const gqlContext = this.createGqlExecutionContext('Bearer valid.token')
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlContext)

    const result = await this.authGuard.canActivate(mockContext)

    expect(result).toBe(true)
    expect(gqlContext.getContext().req['user']).toStrictEqual(mockUser)
  }

  @test
  async '[canActivate] Should throw UnauthorizedException if token is missing'() {
    const mockContext = this.createMockContext()
    const gqlContext = this.createGqlExecutionContext(undefined)
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlContext)

    await expect(this.authGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException)
  }

  @test
  async '[canActivate] Should throw UnauthorizedException if token is invalid'() {
    jest.spyOn(this.authService, 'validateToken').mockRejectedValue(new Error('Invalid token'))

    const mockContext = this.createMockContext()
    const gqlContext = this.createGqlExecutionContext('Bearer invalid.token')
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlContext)

    await expect(this.authGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException)
  }

  @test
  async '[canActivate] Should throw UnauthorizedException if token format is incorrect'() {
    const mockContext = this.createMockContext()
    const gqlContext = this.createGqlExecutionContext('InvalidFormatToken')
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlContext)

    await expect(this.authGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException)
  }
}
