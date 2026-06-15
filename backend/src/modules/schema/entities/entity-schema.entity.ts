import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';
import { FieldSchema } from './field-schema.entity';

@Entity('entity_schemas')
export class EntitySchema extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => FieldSchema, (field) => field.entitySchema, {
    cascade: true,
    eager: true,
  })
  fields: FieldSchema[];
}
