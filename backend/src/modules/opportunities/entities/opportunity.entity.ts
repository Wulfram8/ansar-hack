import { Entity, Column, ManyToOne, JoinColumn, DeleteDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';
import { Contact } from '../../contacts/entities';
import { Lead } from '../../leads/entities';

export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

@Entity('opportunities')
export class Opportunity extends BaseEntity {
  @Column() @Index() title: string;

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  contactId: string | null;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contact_id' }) contact: Contact;

  @Column({ name: 'lead_id', type: 'uuid', nullable: true })
  leadId: string | null;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'lead_id' }) lead: Lead;

  @Column({ type: 'enum', enum: OpportunityStage, default: OpportunityStage.PROSPECTING })
  @Index() stage: OpportunityStage;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  value: number | null;

  @Column({ type: 'int', default: 0 })
  probability: number;

  @Column({ name: 'expected_close_date', type: 'date', nullable: true })
  expectedCloseDate: Date | null;

  @Column({ type: 'text', nullable: true }) notes: string;

  @Column({ type: 'jsonb', name: 'custom_fields', default: {} })
  customFields: Record<string, any>;

  @Column({ name: 'created_by' }) createdBy: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'created_by' }) creator: User;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true }) assignedTo: string | null;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'assigned_to' }) assignee: User;

  @DeleteDateColumn({ name: 'deleted_at' }) deletedAt: Date | null;
}
