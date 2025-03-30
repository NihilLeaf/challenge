import { Test, TestingModule } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { ContentResolver } from 'src/content/resolver'
import { ContentService } from 'src/content/service'
import { ProvisionDto } from 'src/content/dto'
import { Logger } from '@nestjs/common'
import { AuthGuard } from 'src/user/guard'

@suite
export class ContentResolverUnitTest {
  private contentResolver: ContentResolver
  private contentService: ContentService

  private readonly mockProvisionDto: ProvisionDto = {
    id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
    title: 'Sample Content',
    description: 'Test Description',
    url: 'http://localhost:3000/uploads/dummy.pdf',
    created_at: new Date('2025-01-31T23:39:54.236Z'),
    total_likes: 10,
    type: 'pdf',
    allow_download: true,
    is_embeddable: false,
    format: 'pdf',
    bytes: 1024,
    metadata: {},
  }

  async before() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentResolver,
        {
          provide: ContentService,
          useValue: {
            provision: jest.fn().mockImplementation((id: string) => {
              if (id === '00000000-0000-0000-0000-000000000000') {
                throw new Error(
                  'Database error while fetching content: invalid input syntax for type uuid',
                )
              }
              return this.mockProvisionDto
            }),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile()

    this.contentResolver = module.get<ContentResolver>(ContentResolver)
    this.contentService = module.get<ContentService>(ContentService)
  }

  @test
  async '[provision] Should return provisioned content for valid request'() {
    jest.spyOn(this.contentService, 'provision').mockResolvedValue(this.mockProvisionDto)

    const req = {
      user: {
        id: 'valid-user-id',
        company: { id: 'valid-company-id' },
      },
    }

    const result = await this.contentResolver.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', req)

    expect(result).toStrictEqual(this.mockProvisionDto)
    expect(this.contentService.provision).toHaveBeenCalledWith(
      '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      'valid-company-id',
    )
  }

  @test
  async '[provision] Should log provisioning request'() {
    const loggerSpy = jest.spyOn(Logger.prototype, 'log')
    jest.spyOn(this.contentService, 'provision').mockResolvedValue(this.mockProvisionDto)

    const req = {
      user: {
        id: 'valid-user-id',
        company: { id: 'valid-company-id' },
      },
    }

    await this.contentResolver.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', req)

    expect(loggerSpy).toHaveBeenCalledWith(
      `Provisioning content=4372ebd1-2ee8-4501-9ed5-549df46d0eb0 to user=valid-user-id and company=valid-company-id`,
    )
  }

  @test
  async '[provision] Should throw error if company ID is missing'() {
    const req = {
      user: {
        id: 'valid-user-id',
        company: undefined,
      },
    }

    await expect(
      this.contentResolver.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', req),
    ).rejects.toThrow('User ID or Company ID is missing in the context')
  }

  @test
  async '[provision] Should throw error for invalid UUID'() {
    const req = {
      user: {
        id: 'valid-user-id',
        company: { id: 'valid-company-id' },
      },
    }

    await expect(
      this.contentResolver.provision('00000000-0000-0000-0000-000000000000', req),
    ).rejects.toThrow('Database error while fetching content: invalid input syntax for type uuid')
  }
}
