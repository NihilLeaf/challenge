import { suite, test } from '@testdeck/jest'
import { ContentRepository } from 'src/content/repository'
import { DataSource, Repository } from 'typeorm'
import { Content } from 'src/content/entity'

@suite
export class ContentRepositoryUnitTest {
  private contentRepository: ContentRepository
  private dataSourceMock: jest.Mocked<DataSource>
  private repositoryMock: jest.Mocked<Repository<Content>>

  private readonly mockContent: Content = {
    id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
    title: 'Sample Content',
    description: 'Test Description',
    url: 'http://localhost:3000/uploads/dummy.pdf',
    created_at: new Date('2025-01-31T23:39:54.236Z'),
    total_likes: 10,
    type: 'pdf',
  } as Content

  async before() {
    this.repositoryMock = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Content>>

    // Mock do DataSource
    this.dataSourceMock = {
      getRepository: jest.fn().mockReturnValue(this.repositoryMock),
    } as unknown as jest.Mocked<DataSource>
    this.contentRepository = new ContentRepository(this.dataSourceMock)
  }

  @test
  async '[findOne] Should return content when found'() {
    const mockContent: Content = {
      id: 'content-id',
      title: 'Sample Content',
      type: 'text',
      description: 'Sample description',
      url: 'http://example.com',
      cover: null,
      total_likes: 0,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      company_id: 'company-id',
      text_content: null,
    } as Content
    this.repositoryMock.findOne.mockResolvedValue(mockContent)

    const result = await this.contentRepository.findOne('content-id', 'company-id')

    expect(this.dataSourceMock.getRepository).toHaveBeenCalledWith(Content)
    expect(this.repositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        id: 'content-id',
        company_id: 'company-id',
      },
      relations: {
        text_content: true,
      },
    })
    expect(result).toEqual(mockContent)
  }

  @test
  async '[findOne] Should return null when content is not found'() {
    this.repositoryMock.findOne.mockResolvedValue(null)

    const result = await this.contentRepository.findOne('non-existent-id', 'company-id')

    expect(this.dataSourceMock.getRepository).toHaveBeenCalledWith(Content)
    expect(this.repositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        id: 'non-existent-id',
        company_id: 'company-id',
      },
      relations: {
        text_content: true,
      },
    })
    expect(result).toBeNull()
  }

  @test
  async '[findOne] Should throw error if database query fails'() {
    this.repositoryMock.findOne.mockRejectedValue(new Error('Database error'))

    await expect(this.contentRepository.findOne(this.mockContent.id, 'company-id')).rejects.toThrow(
      'Database error',
    )

    expect(this.dataSourceMock.getRepository).toHaveBeenCalledWith(Content)
    expect(this.repositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        id: this.mockContent.id,
        company_id: 'company-id',
      },
      relations: {
        text_content: true,
      },
    })
  }
}
