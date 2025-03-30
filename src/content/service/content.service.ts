import * as fs from 'fs'
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { ContentRepository } from 'src/content/repository'
import { ProvisionDto } from 'src/content/dto'
import { ContentFactory } from 'src/content/utils/factory/content'
import * as crypto from 'crypto'
import * as path from 'path'
import { contentTypeEnumList } from 'src/content/utils/enum/contentType.enum'

@Injectable()
export class ContentService {
  private readonly ONE_HOUR_IN_SECONDS = 3600
  private readonly logger = new Logger(ContentService.name)
  private readonly expirationTime = this.ONE_HOUR_IN_SECONDS

  constructor(private readonly contentRepository: ContentRepository) {}

  async provision(contentId: string, companyId: string): Promise<ProvisionDto> {
    if (!contentId) {
      this.logger.error(`Content ID is missing`)
      throw new UnprocessableEntityException('Content ID is required')
    }

    if (!companyId) {
      this.logger.error(`Company ID is missing`)
      throw new UnprocessableEntityException('Company ID is required')
    }

    let content
    try {
      content = await this.contentRepository.findOne(contentId, companyId)
    } catch (error) {
      this.logger.error(`Database error while fetching content: ${error.message}`)
      throw new NotFoundException('An error occurred while fetching content')
    }

    if (!content) {
      this.logger.warn(`Content not found for id=${contentId}`)
      throw new NotFoundException('Content not found')
    }

    const filePath = content.url ?? undefined
    let bytes = 0

    try {
      if (filePath && this.isValidPath(filePath) && fs.existsSync(filePath)) {
        bytes = fs.statSync(filePath).size
      } else if (filePath && !this.isValidPath(filePath)) {
        this.logger.warn(`Invalid file path: ${filePath}`)
      }
    } catch (error) {
      this.logger.error(`File system error: ${error.message}`)
    }

    const url = this.validateUrl(content.url || '') ? this.generateSignedUrl(content.url || '') : ''

    if (!content.type) {
      this.logger.warn(`Missing content type for ID=${contentId}`)
      throw new BadRequestException('Content type is missing')
    }

    if (!contentTypeEnumList.includes(content.type)) {
      this.logger.warn(`Unsupported content type for ID=${content.id}, type=${content.type}`)
      throw new BadRequestException(`Unsupported content type: ${content.type}`)
    }

    return ContentFactory.returnContentByType(content.type, content, { url, bytes }, this.logger)
  }

  private isValidPath(filePath: string): boolean {
    const basePath = '/static/'
    const normalizedPath = path.normalize(filePath)
    return normalizedPath.startsWith(path.resolve(basePath))
  }

  private validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      return ['http:', 'https:'].includes(parsedUrl.protocol)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.logger.warn(`Invalid URL format: ${url}`)
      return false
    }
  }

  private generateSignedUrl(originalUrl: string): string {
    const expires = Math.floor(Date.now() / 1000) + this.expirationTime
    const signature = crypto
      .createHmac('sha256', process.env.SECRET_KEY || 'default-secret-key')
      .update(`${originalUrl}${expires}`)
      .digest('hex')
    return `${originalUrl}?expires=${expires}&signature=${signature}`
  }
}
