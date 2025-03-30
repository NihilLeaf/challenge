import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'

export class ContentPdf {
  static async returnContentByType(
    content: Content,
    additionalDataReturn: IAdditionalDataReturn,
  ): Promise<ProvisionDto> {
    return {
      ...content,
      ...additionalDataReturn,
      allow_download: true,
      is_embeddable: false,
      format: 'pdf',
      metadata: {
        author: 'Unknown',
        pages: Math.floor(additionalDataReturn.bytes / 50000) || 1,
        encrypted: false,
      },
    }
  }
}
