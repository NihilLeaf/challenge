import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm'

export class AddTextContentToContents1743286676455 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'text_contents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'content_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    )

    await queryRunner.createForeignKey(
      'text_contents',
      new TableForeignKey({
        columnNames: ['content_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'contents',
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.addColumn(
      'contents',
      new TableColumn({
        name: 'text_content_id',
        type: 'uuid',
        isNullable: true,
      }),
    )

    await queryRunner.createForeignKey(
      'contents',
      new TableForeignKey({
        columnNames: ['text_content_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'text_contents',
        onDelete: 'SET NULL',
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('contents', 'FK_contents_text_content_id')
    await queryRunner.dropColumn('contents', 'text_content_id')
    await queryRunner.dropForeignKey('text_contents', 'FK_text_contents_content_id')
    await queryRunner.dropTable('text_contents')
  }
}
