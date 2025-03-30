import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'

export class ContentText {
  static async returnContentByType(
    content: Content,
    additionalData: IAdditionalDataReturn,
  ): Promise<ProvisionDto> {
    return {
      ...content,
      ...additionalData,
      textContent: content.text_content?.text ?? '',
      allow_download: false,
      is_embeddable: false,
      format: 'text/plain',
      metadata: {},
    }
  }
}
