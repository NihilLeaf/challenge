import { BadRequestException, Logger } from '@nestjs/common'
import { ProvisionDto } from 'src/content/dto'
import { Content } from 'src/content/entity'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'
import { ContentImage } from 'src/content/utils/factory/contentImage'
import { ContentLink } from 'src/content/utils/factory/contentLink'
import { ContentPdf } from 'src/content/utils/factory/contentPdf'
import { ContentText } from 'src/content/utils/factory/contentText'
import { ContentVideo } from 'src/content/utils/factory/contentVideo'
import IAdditionalDataReturn from 'src/content/utils/interface/additionalDataReturn.interface'

export class ContentFactory extends Content {
  static async returnContentByType(
    type: contentTypeEnum,
    content: Content,
    additionalDataReturn: IAdditionalDataReturn,
    logger: Logger,
  ): Promise<ProvisionDto> {
    switch (type) {
      case contentTypeEnum.PDF:
        return ContentPdf.returnContentByType(content, additionalDataReturn)
      case contentTypeEnum.IMAGE:
        return ContentImage.returnContentByType(content, additionalDataReturn)
      case contentTypeEnum.VIDEO:
        return ContentVideo.returnContentByType(content, additionalDataReturn)
      case contentTypeEnum.LINK:
        return ContentLink.returnContentByType(content)
      case contentTypeEnum.TEXT:
        return ContentText.returnContentByType(content, additionalDataReturn)
      default:
        logger.warn(`Unsupported content type for ID=${content.id}, type=${content.type}`)
        throw new BadRequestException(`Unsupported content type: ${content.type}`)
    }
  }
}
