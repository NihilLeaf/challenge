import { ContentPdf } from 'src/content/utils/factory/contentPdf'
import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'

describe('ContentPdf', () => {
  it('should return a ProvisionDto with expected properties', async () => {
    const mockContent: Content = {
      id: '123',
      type: 'pdf',
      title: 'Test PDF',
      description: 'A test PDF file',
      url: 'http://example.com/test.pdf',
      cover: 'http://example.com/cover.jpg',
      total_likes: 10,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      company: { id: '1', name: 'Test Company' },
    } as Content

    const mockAdditionalData: IAdditionalDataReturn = {
      url: 'http://example.com/test.pdf',
      bytes: 150000,
    }

    const result: ProvisionDto = await ContentPdf.returnContentByType(
      mockContent,
      mockAdditionalData,
    )

    expect(result).toMatchObject({
      ...mockContent,
      ...mockAdditionalData,
      allow_download: true,
      is_embeddable: false,
      format: 'pdf',
      metadata: {
        author: 'Unknown',
        pages: 3,
        encrypted: false,
      },
    })
  })

  it('should set pages to 1 if bytes is not provided', async () => {
    const mockContent: Content = {
      id: '123',
      type: 'pdf',
      title: 'Test PDF',
      description: 'A test PDF file',
      url: 'http://example.com/test.pdf',
      cover: 'http://example.com/cover.jpg',
      total_likes: 10,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      company: { id: '1', name: 'Test Company' },
    } as Content
    const mockAdditionalData: IAdditionalDataReturn = {
      url: 'http://example.com/test.pdf',
      bytes: 0,
    }

    const result: any = (await ContentPdf.returnContentByType(
      mockContent,
      mockAdditionalData,
    )) as ProvisionDto

    expect(result.metadata.pages).toBe(1)
  })
})
