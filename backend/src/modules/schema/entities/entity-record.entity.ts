import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { EntitySchema } from './entity-schema.entity';
import { User } from '../../users/entities';

@Entity('entity_records')
export class EntityRecord extends BaseEntity {
  @Column({ name: 'entity_schema_id' })
  @Index()
  entitySchemaId: string;

  @ManyToOne(() => EntitySchema, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_schema_id' })
  entitySchema: EntitySchema;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ name: 'created_by' })
  @Index()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  @Index()
  assignedTo: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;
}
