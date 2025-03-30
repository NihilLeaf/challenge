import { ContentImage } from 'src/content/utils/factory/contentImage'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'
import { ProvisionDto } from 'src/content/dto'

describe('ContentImage', () => {
  describe('returnContentByType', () => {
    it('should return a ProvisionDto with correct properties', async () => {
      const content: Content = {
        id: '1',
        url: 'https://example.com/image.png',
        type: 'IMAGE',
      } as unknown as Content

      const additionalDataReturn: IAdditionalDataReturn = {
        extraField: 'extraValue',
        url: '',
        bytes: 0,
      }

      const result: ProvisionDto = await ContentImage.returnContentByType(
        content,
        additionalDataReturn,
      )

      expect(result).toMatchObject({
        ...content,
        ...additionalDataReturn,
        allow_download: true,
        is_embeddable: true,
        format: 'png',
        metadata: { resolution: '1920x1080', aspect_ratio: '16:9' },
      })
    })

    it('should default format to jpg if no URL is provided', async () => {
      const content: Content = {
        id: '2',
        url: '',
        type: 'IMAGE',
      } as unknown as Content

      const additionalDataReturn: IAdditionalDataReturn = {
        url: '',
        bytes: 0,
      }
      const result: ProvisionDto = await ContentImage.returnContentByType(
        content,
        additionalDataReturn,
      )

      expect(result.format).toBe('jpg')
    })
  })
})
