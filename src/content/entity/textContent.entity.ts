import { Content } from 'src/content/entity/content.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('text_contents')
export class TextContent {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  text: string

  @Column()
  content_id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToOne(() => Content, (content) => content.text_content, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'content_id' })
  content?: Content
}
