import * as path from 'path'
import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'
import { IContentFactory } from 'src/content/utils/interface/contentFactory.interface'

export class ContentImage extends Content implements IContentFactory {
  static async returnContentByType(
    content: Content,
    additionalDataReturn: IAdditionalDataReturn,
  ): Promise<ProvisionDto> {
    return {
      ...content,
      ...additionalDataReturn,
      allow_download: true,
      is_embeddable: true,
      format: path.extname(content.url || '').slice(1) || 'jpg',
      metadata: { resolution: '1920x1080', aspect_ratio: '16:9' },
    }
  }
}
