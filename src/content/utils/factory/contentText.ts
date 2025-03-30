import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'
import { IContentFactory } from 'src/content/utils/interface/contentFactory.interface'

export class ContentText extends Content implements IContentFactory {
  static async returnContentByType(
    content: Content,
    additionalData: IAdditionalDataReturn,
  ): Promise<ProvisionDto> {
    return {
      ...content,
      ...additionalData,
      textContent: content?.text_content?.text ?? null,
      allow_download: false,
      is_embeddable: false,
      format: 'text/plain',
      metadata: {},
    }
  }
}
