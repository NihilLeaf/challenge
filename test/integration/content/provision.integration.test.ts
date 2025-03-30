import { Test, TestingModule } from '@nestjs/testing'
import { ContentService } from 'src/content/service/content.service'
import { DataSource } from 'typeorm'
import { Content } from 'src/content/entity/content.entity'
import { TextContent } from 'src/content/entity/textContent.entity'
import { Company } from 'src/company/entity/company.entity'
import { User } from 'src/user/entity/user.entity'
import { ContentRepository } from 'src/content/repository/content.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

const TEST_COMPANY_ID = '123e4567-e89b-12d3-a456-426614174000'
const TEST_TEXT_CONTENT_ID = 'd2b5c7e4-3a9f-4d1b-bc3a-5e8b0f9a0f1c'
const TEST_USER_ID = '123e4567-e89b-12d3-a456-426614174001'
const TEST_CONTENTS = [
  {
    id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
    title: 'Sample Content',
    description: 'This is a sample content.',
    type: 'text',
    url: 'http://example.com/sample-content',
    text_content_id: TEST_TEXT_CONTENT_ID,
  },
  {
    id: '91c8c2e2-5b6f-4e2c-bc4b-6f9b1f0a1f2d',
    title: 'Content Without Text',
    description: 'This content has no associated text content.',
    type: 'text',
    url: 'http://example.com/content-without-text',
    text_content_id: null,
  },
  {
    id: 'a1d9d3e3-6c7f-4f3d-bd5c-7f0c2f1a2f3e',
    title: 'Invalid Content',
    description: 'This content has an invalid type.',
    type: 'invalid_type',
    url: 'http://example.com/invalid-content',
    text_content_id: null,
  },
]

describe('ContentService (Integration)', () => {
  let service: ContentService
  let dataSource: DataSource

  jest.setTimeout(20000)

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT, 10) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_TEST_DATABASE || 'challenge',
          entities: [Content, TextContent, Company, User],
          synchronize: false,
          logging: false,
          migrations: ['src/database/migration/*.ts'],
        }),
        TypeOrmModule.forFeature([Content, TextContent, Company, User]),
      ],
      providers: [ContentService, ContentRepository],
    }).compile()

    service = moduleFixture.get<ContentService>(ContentService)
    dataSource = moduleFixture.get<DataSource>(DataSource)

    await seedDatabase(dataSource)
  })

  afterAll(async () => {
    await cleanDatabase(dataSource)
    await dataSource.destroy()
  })

  const testCases = [
    {
      description: 'Should return provisioned content with text content',
      contentId: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
      companyId: TEST_COMPANY_ID,
      expected: {
        id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
        title: 'Sample Content',
        description: 'This is a sample content.',
        type: 'text',
        textContent: 'This is a sample text content.',
      },
    },
    {
      description: 'Should return provisioned content without text content',
      contentId: '91c8c2e2-5b6f-4e2c-bc4b-6f9b1f0a1f2d',
      companyId: TEST_COMPANY_ID,
      expected: {
        id: '91c8c2e2-5b6f-4e2c-bc4b-6f9b1f0a1f2d',
        title: 'Content Without Text',
        description: 'This content has no associated text content.',
        type: 'text',
        textContent: null,
      },
    },
  ]

  testCases.forEach(({ description, contentId, companyId, expected }) => {
    it(description, async () => {
      const provisionedContent = await service.provision(contentId, companyId)
      expect(provisionedContent).toMatchObject(expected)
    })
  })

  it('Should throw an error for invalid content type', async () => {
    const contentId = 'a1d9d3e3-6c7f-4f3d-bd5c-7f0c2f1a2f3e'
    const companyId = TEST_COMPANY_ID

    await expect(service.provision(contentId, companyId)).rejects.toThrow(
      'Unsupported content type: invalid_type',
    )
  })

  it('Should throw an error if content is not found', async () => {
    const contentId = 'non-existent-id'
    const companyId = TEST_COMPANY_ID

    await expect(service.provision(contentId, companyId)).rejects.toThrow(
      'An error occurred while fetching content',
    )
  })
})

async function createAndSave(repository, data) {
  const entity = repository.create(data)
  await repository.save(entity)
  return entity
}

async function seedDatabase(dataSource: DataSource) {
  const companyRepository = dataSource.getRepository(Company)
  const contentRepository = dataSource.getRepository(Content)
  const textContentRepository = dataSource.getRepository(TextContent)
  const userRepository = dataSource.getRepository(User)

  const company = await createAndSave(companyRepository, {
    id: TEST_COMPANY_ID,
    name: 'Test Company',
  })

  await createAndSave(userRepository, {
    id: TEST_USER_ID,
    name: 'Test User',
    email: 'testuser@example.com',
    role: 'admin',
    password: 'hashed-password',
    company: company,
    company_id: company.id,
  })

  let contents = TEST_CONTENTS.map((content) => ({
    ...content,
    company_id: company.id,
    total_likes: 0,
  }))

  const textContent = await textContentRepository.create({
    id: TEST_TEXT_CONTENT_ID,
    text: 'This is a sample text content.',
    content_id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
  })

  contents = contents.map((content) => {
    if (content.id == '81b7b1d1-4ad3-445f-b704-b29d55fee063')
      content.text_content_id = textContent.id
    return content
  })
  await contentRepository.save(contents)
  await textContentRepository.save(textContent)
}

async function cleanDatabase(dataSource: DataSource) {
  const companyRepository = dataSource.getRepository(Company)
  const contentRepository = dataSource.getRepository(Content)
  const textContentRepository = dataSource.getRepository(TextContent)
  const userRepository = dataSource.getRepository(User)

  await textContentRepository.delete({ id: TEST_TEXT_CONTENT_ID })
  await contentRepository.delete(TEST_CONTENTS.map((content) => content.id))
  await companyRepository.delete({ id: TEST_COMPANY_ID })
  await userRepository.delete({ id: TEST_USER_ID })
}
