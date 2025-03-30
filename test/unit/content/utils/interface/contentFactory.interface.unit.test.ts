import { Logger } from '@nestjs/common'
import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'
import { IContentFactory } from 'src/content/utils/interface/contentFactory.interface'

class ContentFactoryImplementation extends IContentFactory {
  static async returnContentByType(
    content: Content,
    type?: string | contentTypeEnum,
    additionalDataReturn?: IAdditionalDataReturn,
    logger?: Logger,
  ): Promise<ProvisionDto> {
    if (!type || !content) {
      throw new Error('Invalid content or type')
    }

    logger?.log(`Processing content of type: ${type}`)

    return {
      id: content.id,
      title: content.title,
      created_at: content.created_at,
      total_likes: content.total_likes,
      type: type as string,
      url: additionalDataReturn?.url || '',
      bytes: additionalDataReturn?.bytes || 0,
      metadata: additionalDataReturn?.metadata || {},
      allow_download: true,
      is_embeddable: true,
    }
  }
}

describe('IContentFactory', () => {
  let logger: Logger

  beforeEach(() => {
    logger = new Logger('TestLogger')
    jest.spyOn(logger, 'log').mockImplementation(() => {})
  })

  it('should return provisioned content for valid input', async () => {
    const mockContent: Content = {
      id: 'content-id',
      title: 'Sample Content',
      type: contentTypeEnum.TEXT,
      description: 'Sample description',
      url: 'http://example.com',
      created_at: new Date(),
      updated_at: new Date(),
      total_likes: 0,
    } as Content

    const additionalData: IAdditionalDataReturn = {
      url: 'http://example.com/signed-url',
      bytes: 1024,
      metadata: { key: 'value' },
    }

    const result = await ContentFactoryImplementation.returnContentByType(
      mockContent,
      contentTypeEnum.TEXT,
      additionalData,
      logger,
    )

    expect(result).toMatchObject({
      id: 'content-id',
      type: contentTypeEnum.TEXT,
      url: 'http://example.com/signed-url',
      bytes: 1024,
      metadata: { key: 'value' },
      allow_download: true,
      is_embeddable: true,
    })

    expect(logger.log).toHaveBeenCalledWith('Processing content of type: text')
  })

  it('should throw an error if content is invalid', async () => {
    await expect(
      ContentFactoryImplementation.returnContentByType(
        null as unknown as Content,
        contentTypeEnum.TEXT,
      ),
    ).rejects.toThrow('Invalid content or type')
  })

  it('should throw an error if type is invalid', async () => {
    const mockContent: Content = {
      id: 'content-id',
      title: 'Sample Content',
      type: contentTypeEnum.TEXT,
      description: 'Sample description',
      url: 'http://example.com',
      created_at: new Date(),
      updated_at: new Date(),
      total_likes: 0,
    } as Content

    await expect(
      ContentFactoryImplementation.returnContentByType(mockContent, undefined),
    ).rejects.toThrow('Invalid content or type')
  })
})
