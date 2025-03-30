import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm'
import { Company } from 'src/company/entity'
import contentTypeEnum from 'src/content/utils/enum/contentType.enum'
import { TextContent } from 'src/content/entity/textContent.entity'

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column()
  type: contentTypeEnum | string

  @Column()
  description?: string

  @Column()
  url: string

  @Column()
  cover?: string

  @Column({ type: 'int' })
  total_likes: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date | null

  @Column()
  company_id?: string

  @ManyToOne(() => Company, (company) => company.contents)
  @JoinColumn({ name: 'company_id' })
  company: Company

  @Column()
  text_content_id?: string

  @OneToOne(() => TextContent, (text_content) => text_content.content)
  @JoinColumn({ name: 'text_content_id' })
  text_content?: TextContent
}
