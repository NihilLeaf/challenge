import { BadRequestException, Logger } from '@nestjs/common'
import { ContentFactory } from 'src/content/utils/factory/content'
import { Content } from 'src/content/entity'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'
import { ContentImage } from 'src/content/utils/factory/contentImage'
import { ContentLink } from 'src/content/utils/factory/contentLink'
import { ContentPdf } from 'src/content/utils/factory/contentPdf'
import { ContentVideo } from 'src/content/utils/factory/contentVideo'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'

jest.mock('src/content/utils/factory/contentImage')
jest.mock('src/content/utils/factory/contentLink')
jest.mock('src/content/utils/factory/contentPdf')
jest.mock('src/content/utils/factory/contentVideo')

describe('ContentFactory', () => {
  let logger: Logger
  let content: Content
  let additionalData: IAdditionalDataReturn

  beforeEach(() => {
    logger = new Logger('ContentFactoryTest')
    content = { id: 'test-id', type: contentTypeEnum.PDF } as Content
    additionalData = { url: 'http://test.com/file.pdf', bytes: 12345 }
  })

  it('should return PDF content', async () => {
    ContentPdf.returnContentByType = jest.fn().mockResolvedValue('pdf-content')
    const result = await ContentFactory.returnContentByType(
      contentTypeEnum.PDF,
      content,
      additionalData,
      logger,
    )
    expect(result).toBe('pdf-content')
  })

  it('should return Image content', async () => {
    ContentImage.returnContentByType = jest.fn().mockResolvedValue('image-content')
    const result = await ContentFactory.returnContentByType(
      contentTypeEnum.IMAGE,
      content,
      additionalData,
      logger,
    )
    expect(result).toBe('image-content')
  })

  it('should return Video content', async () => {
    ContentVideo.returnContentByType = jest.fn().mockResolvedValue('video-content')
    const result = await ContentFactory.returnContentByType(
      contentTypeEnum.VIDEO,
      content,
      additionalData,
      logger,
    )
    expect(result).toBe('video-content')
  })

  it('should return Link content', async () => {
    ContentLink.returnContentByType = jest.fn().mockResolvedValue('link-content')
    const result = await ContentFactory.returnContentByType(
      contentTypeEnum.LINK,
      content,
      additionalData,
      logger,
    )
    expect(result).toBe('link-content')
  })

  it('should throw BadRequestException for unsupported content type', async () => {
    content.type = 'unsupported' as contentTypeEnum
    jest.spyOn(logger, 'warn').mockImplementation(() => {})
    await expect(
      ContentFactory.returnContentByType(
        'unsupported' as contentTypeEnum,
        content,
        additionalData,
        logger,
      ),
    ).rejects.toThrow(BadRequestException)
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unsupported content type'))
  })
})
