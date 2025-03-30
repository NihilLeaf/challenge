import { Logger } from '@nestjs/common'
import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'

export abstract class IContentFactory {
  static returnContentByType: (
    content: Content,
    type?: string | contentTypeEnum,
    additionalDataReturn?: IAdditionalDataReturn,
    logger?: Logger,
  ) => Promise<ProvisionDto>
}
