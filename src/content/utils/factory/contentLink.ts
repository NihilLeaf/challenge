import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'

export class ContentLink {
  static async returnContentByType(content: Content): Promise<ProvisionDto> {
    return {
      ...content,
      url: content.url || 'http://default.com',
      allow_download: false,
      is_embeddable: true,
      format: null,
      bytes: 0,
      metadata: { trusted: content.url?.includes('https') || false },
    }
  }
}
