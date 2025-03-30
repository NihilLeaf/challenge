import { DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Content } from 'src/content/entity'

@Injectable()
export class ContentRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findOne(contentId: string, company_id: string): Promise<Content | null> {
    const content = await this.dataSource.getRepository(Content).findOne({
      where: {
        id: contentId,
        company_id: company_id,
      },
      relations: {
        text_content: true,
      },
    })

    return content || null
  }
}
