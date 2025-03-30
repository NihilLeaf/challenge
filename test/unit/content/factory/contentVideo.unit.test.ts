import { ContentVideo } from 'src/content/utils/factory/contentVideo'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'

describe('ContentVideo', () => {
  it('should return a ProvisionDto with correct values', async () => {
    const content: Content = { id: 1, url: 'video.mp4' } as unknown as Content
    const additionalData: IAdditionalDataReturn = {
      bytes: 500000,
      url: '',
    }

    const result = await ContentVideo.returnContentByType(content, additionalData)

    expect(result).toEqual(
      expect.objectContaining({
        ...content,
        ...additionalData,
        allow_download: false,
        is_embeddable: true,
        format: 'mp4',
        metadata: expect.objectContaining({
          duration: 5,
          resolution: '1080p',
        }),
      }),
    )
  })

  it('should default format to mp4 if content URL is missing', async () => {
    const content: Content = { id: 1 } as unknown as Content
    const additionalData: IAdditionalDataReturn = {
      bytes: 500000,
      url: '',
    }

    const result = await ContentVideo.returnContentByType(content, additionalData)

    expect(result.format).toBe('mp4')
  })

  it('should calculate duration correctly based on bytes', async () => {
    const content: Content = { id: 1, url: 'video.webm' } as unknown as Content
    const additionalData: IAdditionalDataReturn = {
      bytes: 2000000,
      url: '',
    }

    const result = await ContentVideo.returnContentByType(content, additionalData)

    expect((result.metadata as { duration: number }).duration).toBe(20)
  })

  it('should default duration to 10 if bytes is 0 or undefined', async () => {
    const content: Content = { id: 1, url: 'video.mp4' } as unknown as Content
    const additionalData: IAdditionalDataReturn = {
      bytes: 0,
      url: '',
    }

    const result = await ContentVideo.returnContentByType(content, additionalData)

    expect((result.metadata as { duration: number }).duration).toBe(10)
  })
})
