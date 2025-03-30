import { Test, TestingModule } from '@nestjs/testing'
import { suite, test } from '@testdeck/jest'
import { ContentService } from 'src/content/service'
import { ContentRepository } from 'src/content/repository'
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { Content } from 'src/content/entity'
import * as fs from 'fs'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'
import { ContentFactory } from 'src/content/utils/factory/content'

@suite
export class ContentServiceUnitTest {
  private contentService: ContentService
  private contentRepository: ContentRepository

  private readonly mockContent = (
    type: string,
    format?: string,
    url?: string,
    textContent?: any,
  ): Content =>
    ({
      id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      title: `Test ${type}`,
      description: `Description for ${type}`,
      url: url || `http://localhost:3000/uploads/dummy.${format}`,
      created_at: new Date('2025-01-31T23:39:54.236Z'),
      total_likes: 10,
      type,
      text_content: textContent,
    }) as Content

  async before() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: ContentRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    this.contentService = module.get<ContentService>(ContentService)
    this.contentRepository = module.get<ContentRepository>(ContentRepository)
  }

  @test
  async '[provision] Should throw BadRequestException if content type is missing'() {
    const mockContent = {
      id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      url: 'http://localhost:3000/uploads/dummy.undefined',
      type: undefined,
    }
    ;(this.contentRepository.findOne as jest.Mock).mockResolvedValue(mockContent)

    const loggerSpy = jest.spyOn(this.contentService['logger'], 'warn').mockImplementation(() => {})

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', 'test-company-id'),
    ).rejects.toThrow(BadRequestException)

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing content type for ID=4372ebd1-2ee8-4501-9ed5-549df46d0eb0'),
    )
  }

  @test
  async '[provision] Should return provisioned PDF content'() {
    const mockContent = {
      id: 'content-id',
      url: '/static/file.pdf',
      type: 'pdf',
      title: 'Sample PDF',
    }
    const mockProvisionedContent = {
      type: 'pdf',
      allow_download: true,
      is_embeddable: false,
      bytes: 50000,
      format: 'pdf',
      metadata: { author: 'Unknown', encrypted: false },
      title: 'Sample PDF',
      url: '/static/file.pdf',
      id: 'content-id',
      created_at: new Date('2025-03-29T21:17:30.069Z'),
      total_likes: 0,
    }
    ;(this.contentRepository.findOne as jest.Mock).mockResolvedValue(mockContent)
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 50000 } as fs.Stats)
    jest
      .spyOn(ContentFactory, 'returnContentByType')
      .mockReturnValue(Promise.resolve(mockProvisionedContent))

    const result = await this.contentService.provision('content-id', 'company-id')
    expect(result).toMatchObject(mockProvisionedContent)
  }

  @test
  async '[provision] Should return provisioned Image content'() {
    const mockContent: Content = {
      id: 'content-id',
      title: 'Sample Image',
      description: 'Sample description',
      url: '/static/image.png',
      created_at: new Date(),
      updated_at: new Date(),
      total_likes: 0,
      type: contentTypeEnum.IMAGE,
    } as Content

    const mockProvisionedContent = {
      id: 'content-id',
      title: 'Sample Image',
      url: '/static/image.png',
      created_at: new Date(),
      total_likes: 0,
      type: 'image',
      allow_download: true,
      is_embeddable: true,
      bytes: 20000,
      format: 'png',
      metadata: { aspect_ratio: '16:9', resolution: '1920x1080' },
    }

    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(mockContent)
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 20000 } as fs.Stats)
    jest.spyOn(ContentFactory, 'returnContentByType').mockReturnValue(
      Promise.resolve({
        id: 'content-id',
        title: 'Sample Image',
        url: '/static/image.png',
        created_at: new Date(),
        total_likes: 0,
        type: 'image',
        allow_download: true,
        is_embeddable: true,
        bytes: 20000,
        format: 'png',
        metadata: { aspect_ratio: '16:9', resolution: '1920x1080' },
      }),
    )

    const result = await this.contentService.provision('content-id', 'company-id')
    expect(result).toMatchObject({
      ...mockProvisionedContent,
      created_at: expect.any(Date),
    })
    expect(result.created_at.getTime()).toBeCloseTo(mockProvisionedContent.created_at.getTime(), -1)
  }

  @test
  async '[provision] Should return provisioned Image content with default format'() {
    const mockContent = { id: 'content-id', url: '/static/image.jpg', type: 'image' }
    const mockProvisionedContent = {
      type: 'image',
      allow_download: true,
      is_embeddable: true,
      bytes: 20000,
      format: 'jpg',
      metadata: { aspect_ratio: '16:9', resolution: '1920x1080' },
    }
    ;(this.contentRepository.findOne as jest.Mock).mockResolvedValue(mockContent)
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 20000 } as fs.Stats)
    jest.spyOn(ContentFactory, 'returnContentByType').mockReturnValue(
      Promise.resolve({
        id: 'content-id',
        title: 'Sample Image',
        url: '/static/image.jpg',
        created_at: new Date(),
        total_likes: 0,
        type: 'image',
        allow_download: true,
        is_embeddable: true,
        bytes: 20000,
        format: 'jpg',
        metadata: { aspect_ratio: '16:9', resolution: '1920x1080' },
      }),
    )

    const result = await this.contentService.provision('content-id', 'company-id')
    expect(result).toMatchObject(mockProvisionedContent)
  }

  @test
  async '[provision] Should return provisioned Video content'() {
    const mockContent = { id: 'content-id', url: '/static/video.avi', type: 'video' }
    const mockProvisionedContent = {
      id: 'content-id',
      title: 'Sample Video',
      url: '/static/video.avi',
      created_at: expect.any(Date),
      total_likes: 0,
      type: 'video',
      allow_download: false,
      is_embeddable: true,
      bytes: 1000000,
      format: 'avi',
      metadata: { duration: 10, resolution: '1080p' },
    }
    ;(this.contentRepository.findOne as jest.Mock).mockResolvedValue(mockContent)
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1000000 } as fs.Stats)
    jest.spyOn(ContentFactory, 'returnContentByType').mockResolvedValue({
      ...mockProvisionedContent,
      created_at: new Date(),
    })

    const result = await this.contentService.provision('content-id', 'company-id')
    expect(result).toMatchObject(mockProvisionedContent)
  }

  @test
  async '[provision] Should return provisioned Video content with default format'() {
    const mockContent = { id: 'content-id', url: '/static/video.mp4', type: 'video' }
    const mockProvisionedContent = {
      type: 'video',
      allow_download: false,
      is_embeddable: true,
      bytes: 1000000,
      format: 'mp4',
      metadata: { duration: 10, resolution: '1080p' },
    }
    ;(this.contentRepository.findOne as jest.Mock).mockResolvedValue(mockContent)
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1000000 } as fs.Stats)
    jest.spyOn(ContentFactory, 'returnContentByType').mockResolvedValue({
      ...mockProvisionedContent,
      id: 'content-id',
      title: 'Sample Video',
      url: '/static/video.mp4',
      created_at: new Date(),
      total_likes: 0,
    })

    const result = await this.contentService.provision('content-id', 'company-id')
    expect(result).toMatchObject(mockProvisionedContent)
  }

  @test
  async '[provision] Should return provisioned Link content'() {
    jest
      .spyOn(this.contentRepository, 'findOne')
      .mockResolvedValue(this.mockContent('link', null, 'https://example.com'))

    const result = await this.contentService.provision(
      '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      'test-company-id',
    )

    expect(result).toMatchObject({
      type: 'link',
      allow_download: false,
      is_embeddable: true,
      format: null,
      bytes: 0,
      metadata: { trusted: true },
    })
  }

  @test
  async '[provision] Should throw UnprocessableEntityException if content ID is missing'() {
    await expect(this.contentService.provision('', 'test-company-id')).rejects.toThrow(
      UnprocessableEntityException,
    )
  }

  @test
  async '[provision] Should throw NotFoundException if content is not found'() {
    ;(this.contentRepository.findOne as jest.Mock).mockResolvedValue(null)

    const loggerSpy = jest.spyOn(this.contentService['logger'], 'warn').mockImplementation(() => {})

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', 'test-company-id'),
    ).rejects.toThrow(NotFoundException)

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Content not found for id=4372ebd1-2ee8-4501-9ed5-549df46d0eb0'),
    )
  }

  @test
  async '[provision] Should throw NotFoundException if database query fails'() {
    ;(this.contentRepository.findOne as jest.Mock).mockRejectedValue(new Error('DB error'))

    const loggerSpy = jest
      .spyOn(this.contentService['logger'], 'error')
      .mockImplementation(() => {})

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', 'test-company-id'),
    ).rejects.toThrow(NotFoundException)

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Database error while fetching content: DB error'),
    )
  }

  @test
  async '[provision] Should throw BadRequestException for unsupported content type'() {
    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(this.mockContent('unsupported'))

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', 'test-company-id'),
    ).rejects.toThrow(BadRequestException)
  }

  @test
  async '[provision] Should return provisioned content with text_content relation'() {
    const mockTextContent = {
      id: 'text-content-id',
      text: 'Sample text content',
    }

    const mockContent = this.mockContent(
      'text',
      'txt',
      'http://localhost:3000/uploads/text.txt',
      mockTextContent,
    )

    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(mockContent)

    const result = await this.contentService.provision(
      '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      'test-company-id',
    )

    expect(result).toMatchObject({
      id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      type: 'text',
      text_content: {
        id: 'text-content-id',
        text: 'Sample text content',
      },
    })
  }

  @test
  async '[provision] Should handle content without text_content relation'() {
    const mockContent = this.mockContent(
      'text',
      'txt',
      'http://localhost:3000/uploads/text.txt',
      null,
    )

    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(mockContent)

    const result = await this.contentService.provision(
      '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      'test-company-id',
    )

    expect(result).toMatchObject({
      id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
      type: 'text',
      text_content: null,
    })
  }

  @test
  async '[provision] Should throw NotFoundException if content with text_content is not found'() {
    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(null)

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', 'test-company-id'),
    ).rejects.toThrow(NotFoundException)
  }

  @test
  async '[provision] Should throw BadRequestException for unsupported content type with text_content'() {
    const mockTextContent = {
      id: 'text-content-id',
      text: 'Sample text content',
    }

    const mockContent = this.mockContent(
      'unsupported',
      'txt',
      'http://localhost:3000/uploads/text.txt',
      mockTextContent,
    )

    jest.spyOn(this.contentRepository, 'findOne').mockResolvedValue(mockContent)

    await expect(
      this.contentService.provision('4372ebd1-2ee8-4501-9ed5-549df46d0eb0', 'test-company-id'),
    ).rejects.toThrow(BadRequestException)
  }

  @test
  async '[provision] Should throw BadRequestException for invalid content ID format'() {
    const invalidId = 'non-existent-id'

    await expect(this.contentService.provision(invalidId, 'test-company-id')).rejects.toThrow(
      NotFoundException,
    )
  }
}
