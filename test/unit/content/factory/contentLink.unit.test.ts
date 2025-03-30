import { ContentLink } from 'src/content/utils/factory/contentLink'
import { Content } from 'src/content/entity'
import { ProvisionDto } from 'src/content/dto'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'

describe('ContentLink', () => {
  it('should return a ProvisionDto with the correct properties', async () => {
    const mockContent: Content = {
      id: '123',
      type: contentTypeEnum.LINK,
      title: 'Sample Content',
      description: 'A sample description',
      url: 'https://example.com/video',
      cover: 'https://example.com/cover.jpg',
      total_likes: 10,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      company: {
        id: 'company1',
        name: 'Sample Company',
        users: [],
        contents: [],
      },
    }

    const result: ProvisionDto = await ContentLink.returnContentByType(mockContent)

    expect(result).toEqual({
      ...mockContent,
      url: 'https://example.com/video',
      allow_download: false,
      is_embeddable: true,
      format: null,
      bytes: 0,
      metadata: { trusted: true },
    })
  })

  it('should use default URL if content.url is missing', async () => {
    const mockContent: Content = {
      id: '123',
      type: contentTypeEnum.LINK,
      title: 'Sample Content',
      description: 'A sample description',
      url: '',
      cover: 'https://example.com/cover.jpg',
      total_likes: 10,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      company: {
        id: 'company1',
        name: 'Sample Company',
        users: [],
        contents: [],
      },
    }

    const result: any = (await ContentLink.returnContentByType(mockContent)) as ProvisionDto

    expect(result.url).toBe('http://default.com')
    expect(result.metadata.trusted).toBe(false)
  })
})
