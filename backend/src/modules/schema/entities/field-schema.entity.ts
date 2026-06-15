import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { EntitySchema } from './entity-schema.entity';

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  RICH_TEXT = 'rich_text',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  DATE = 'date',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  BOOLEAN = 'boolean',
  URL = 'url',
  CURRENCY = 'currency',
  RELATION = 'relation',
  FILE = 'file',
}

@Entity('field_schemas')
export class FieldSchema extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ name: 'field_type', type: 'enum', enum: FieldType })
  fieldType: FieldType;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'default_value', nullable: true })
  defaultValue: string;

  @Column({ type: 'jsonb', nullable: true })
  options: Record<string, any>;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'entity_schema_id' })
  entitySchemaId: string;

  @ManyToOne(() => EntitySchema, (schema) => schema.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entity_schema_id' })
  entitySchema: EntitySchema;
}
