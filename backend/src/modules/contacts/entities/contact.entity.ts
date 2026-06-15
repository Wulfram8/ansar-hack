import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

@Entity('contacts')
export class Contact extends BaseEntity {
  @Column({ name: 'first_name' })
  @Index()
  firstName: string;

  @Column({ name: 'last_name' })
  @Index()
  lastName: string;

  @Column({ nullable: true })
  @Index()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', name: 'custom_fields', default: {} })
  customFields: Record<string, any>;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  assignedTo: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
