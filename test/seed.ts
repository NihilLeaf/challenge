/* eslint-disable no-console */
import { DataSource } from 'typeorm'
import { User } from 'src/user/entity'
import { Company } from 'src/company/entity'
import { AppDataSource } from 'src/database/data-source.database'
import { Content, TextContent } from 'src/content/entity'

export const seedDatabase = async (dataSource: DataSource) => {
  const queryRunner = dataSource.createQueryRunner()
  await queryRunner.connect()

  const company1 = queryRunner.manager.create(Company, { name: 'Company A' })
  const company2 = queryRunner.manager.create(Company, { name: 'Company B' })

  const [createdCompany1, createdCompany2] = await Promise.all([
    queryRunner.manager.save(company1),
    queryRunner.manager.save(company2),
  ])

  const user1 = queryRunner.manager.create(User, {
    id: '18c37ce2-cd34-4305-9ca4-c15fc736beac',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    password: 'hashed-password',
    company: createdCompany1,
  })
  const user2 = queryRunner.manager.create(User, {
    name: 'Foo Bar',
    email: 'foo@example.com',
    role: 'admin',
    password: 'hashed-password',
    company: createdCompany2,
  })

  await Promise.all([queryRunner.manager.save(user1), queryRunner.manager.save(user2)])

  await Promise.all([
    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: '4372ebd1-2ee8-4501-9ed5-549df46d0eb0',
        title: 'Introdução à Cultura Tech',
        description: 'Uma imagem ilustrativa sobre a cultura de trabalho em equipe.',
        url: 'http://localhost:3000/uploads/image1.jpg',
        cover: 'http://localhost:3000/uploads/image1-cover.jpg',
        type: 'image',
        total_likes: 0,
        company: createdCompany1,
      }),
    ),
    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: '26a42e72-cc93-44b3-acae-01537a36322b',
        title: 'Ambiente de Trabalho Moderno',
        description:
          'Uma imagem representando espaços colaborativos e inovação nas empresas de tecnologia.',
        url: 'http://localhost:3000/uploads/image2.png',
        cover: 'http://localhost:3000/uploads/image2-cover.jpg',
        type: 'image',
        total_likes: 2,
        company: createdCompany1,
      }),
    ),
    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: '7acff1c5-4c43-4923-a323-d22a12573041',
        title: 'Guia de Boas Práticas em Desenvolvimento',
        description:
          'Um documento detalhado sobre boas práticas de programação e metodologias ágeis.',
        url: 'http://localhost:3000/uploads/pdf1.pdf',
        cover: 'http://localhost:3000/uploads/pdf1-cover.jpg',
        type: 'pdf',
        total_likes: 4,
        company: createdCompany1,
      }),
    ),
    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: '3a5a94aa-17da-4e9a-b493-fe7e81294631',
        title: 'Manual de Arquitetura de Software',
        description:
          'Um manual técnico abordando padrões arquiteturais e boas práticas para sistemas escaláveis.',
        url: 'http://localhost:3000/uploads/pdf2.pdf',
        cover: 'http://localhost:3000/uploads/pdf2-cover.jpg',
        type: 'pdf',
        total_likes: 6,
        company: createdCompany2,
      }),
    ),
    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: '6969d6c7-40ea-4a3c-b635-d6546b971304',
        title: 'Plataforma de Aprendizado Online',
        description:
          'Acesse este link para cursos e treinamentos voltados para tecnologia e inovação.',
        url: 'https://learning.rocks',
        cover: null,
        type: 'link',
        total_likes: 8,
        company: createdCompany1,
      }),
    ),
    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: 'd060ab17-c961-4de7-929f-a0d52aa3ecf4',
        title: 'Inteligência artificial',
        description: null,
        url: 'http://localhost:3000/uploads/video1.mp4',
        cover: 'http://localhost:3000/uploads/video1-cover.jpg',
        type: 'video',
        total_likes: 10,
        company: createdCompany1,
      }),
    ),

    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: 'd2b5c7e4-3a9f-4d1b-bc3a-5e8b0f9a0f1c',
        title: 'Texto De Exemplo',
        description: 'Um texto de exemplo.',
        url: 'http://localhost:3000/uploads/text1.txt',
        cover: null,
        type: 'text',
        total_likes: 10,
        company: createdCompany1,
      }),
    ),

    queryRunner.manager.save(
      queryRunner.manager.create(Content, {
        id: 'a0e5c1f5-da2c-46d3-9776-99481496db51',
        title: 'Texto De Exemplo 2',
        description: 'Outro texto de exemplo.',
        url: 'http://localhost:3000/uploads/text2.txt',
        cover: null,
        type: 'text',
        total_likes: 10,
        company: createdCompany1,
      }),
    ),
  ])

  await queryRunner.manager.insert(TextContent, {
    id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
    content_id: 'd2b5c7e4-3a9f-4d1b-bc3a-5e8b0f9a0f1c',
    text: 'Este é um texto de exemplo para o conteúdo de texto.',
  })

  await queryRunner.manager.update(
    Content,
    { id: 'd2b5c7e4-3a9f-4d1b-bc3a-5e8b0f9a0f1c' },
    {
      text_content_id: '81b7b1d1-4ad3-445f-b704-b29d55fee063',
    },
  )

  console.info('Database seeded successfully.')
  await queryRunner.release()

  process.exit(0)
}

AppDataSource.initialize()
  .then(() => seedDatabase(AppDataSource))
  .catch((err) => console.error('Error seeding database:', err))
