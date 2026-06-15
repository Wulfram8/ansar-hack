import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';
import { Contact } from '../../contacts/entities';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('leads')
export class Lead extends BaseEntity {
  @Column()
  @Index()
  title: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId: string | null;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  @Index()
  status: LeadStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  value: number | null;

  @Column({ type: 'enum', enum: LeadPriority, default: LeadPriority.MEDIUM })
  priority: LeadPriority;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
