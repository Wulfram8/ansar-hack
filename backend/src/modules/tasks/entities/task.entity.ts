import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

export enum TaskStatus { TODO = 'todo', IN_PROGRESS = 'in_progress', DONE = 'done', CANCELLED = 'cancelled' }
export enum TaskPriority { LOW = 'low', MEDIUM = 'medium', HIGH = 'high', URGENT = 'urgent' }

@Entity('tasks')
export class Task extends BaseEntity {
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO }) @Index() status: TaskStatus;
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM }) priority: TaskPriority;
  @Column({ name: 'due_date', type: 'timestamp', nullable: true }) dueDate: Date | null;
  @Column({ name: 'related_entity_type', type: 'varchar', nullable: true }) relatedEntityType: string | null;
  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true }) relatedEntityId: string | null;
  @Column({ type: 'jsonb', name: 'custom_fields', default: {} }) customFields: Record<string, any>;
  @Column({ name: 'created_by' }) createdBy: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'created_by' }) creator: User;
  @Column({ name: 'assigned_to', type: 'uuid', nullable: true }) assignedTo: string | null;
  @ManyToOne(() => User, { nullable: true }) @JoinColumn({ name: 'assigned_to' }) assignee: User;
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true }) completedAt: Date | null;
}
