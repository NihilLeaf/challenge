import * as path from 'path'
import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'
import { IContentFactory } from 'src/content/utils/interface/contentFactory.interface'

export class ContentVideo extends Content implements IContentFactory {
  static async returnContentByType(
    content: Content,
    additionalDataReturn: IAdditionalDataReturn,
  ): Promise<ProvisionDto> {
    return {
      ...content,
      ...additionalDataReturn,
      allow_download: false,
      is_embeddable: true,
      format: path.extname(content.url || '').slice(1) || 'mp4',
      metadata: {
        duration: Math.floor(additionalDataReturn.bytes / 100000) || 10,
        resolution: '1080p',
      },
    }
  }
}
