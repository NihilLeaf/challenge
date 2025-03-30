/* eslint-disable no-console */
import { DataSource } from 'typeorm'
import { Company } from 'src/company/entity'
import { AppDataSource } from 'src/database/data-source.database'
import { Content, TextContent } from 'src/content/entity'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'

export const seedTextContent = async (dataSource: DataSource) => {
  const queryRunner = dataSource.createQueryRunner()
  await queryRunner.connect()

  const company = await queryRunner.manager.findOne(Company, {
    where: { id: 'd2a863d6-73bf-4fa6-9b4a-0d9d704fb6b5' },
  })

  if (!company) {
    console.error('Company not found. Seeding aborted.')
    await queryRunner.release()
    process.exit(1)
  }

  await Promise.all([
    queryRunner.manager.insert(Content, {
      id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
      title: 'Texto De Exemplo',
      description: 'Um texto de exemplo.',
      type: contentTypeEnum.TEXT,
      cover: null,
      url: 'http://localhost:3000/uploads/text1.txt',
      total_likes: 0,
      company: company,
    }),
    queryRunner.manager.insert(Content, {
      id: 'd2b5c7e4-3a9f-4d1b-bc3a-5e8b0f9a0f1c',
      title: 'Texto De Exemplo 2',
      description: 'Outro texto de exemplo.',
      type: contentTypeEnum.TEXT,
      cover: null,
      url: 'http://localhost:3000/uploads/text2.txt',
      total_likes: 0,
      company: company,
    }),
  ])

  await queryRunner.manager.insert(TextContent, {
    id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
    content_id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
    text: 'Este é um texto de exemplo para o conteúdo de texto.',
  })

  console.info('Text content seeded successfully.')
  await queryRunner.release()

  process.exit(0)
}

AppDataSource.initialize()
  .then(() => seedTextContent(AppDataSource))
  .catch((err) => console.error('Error seeding database:', err))
