import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

export enum EmailDirection { INBOUND = 'inbound', OUTBOUND = 'outbound' }
export enum EmailStatus { DRAFT = 'draft', SENT = 'sent', FAILED = 'failed', RECEIVED = 'received' }

@Entity('emails')
export class Email extends BaseEntity {
  @Column({ name: 'from_address' }) fromAddress: string;
  @Column('simple-array', { name: 'to_addresses' }) toAddresses: string[];
  @Column('simple-array', { name: 'cc_addresses', nullable: true }) ccAddresses: string[];
  @Column() subject: string;
  @Column({ name: 'body_html', type: 'text', nullable: true }) bodyHtml: string;
  @Column({ name: 'body_text', type: 'text', nullable: true }) bodyText: string;
  @Column({ type: 'enum', enum: EmailStatus, default: EmailStatus.DRAFT }) status: EmailStatus;
  @Column({ type: 'enum', enum: EmailDirection, default: EmailDirection.OUTBOUND }) direction: EmailDirection;
  @Column({ name: 'related_entity_type', type: 'varchar', nullable: true }) relatedEntityType: string | null;
  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true }) relatedEntityId: string | null;
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true }) sentAt: Date | null;
  @Column({ name: 'created_by' }) @Index() createdBy: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'created_by' }) creator: User;
}
