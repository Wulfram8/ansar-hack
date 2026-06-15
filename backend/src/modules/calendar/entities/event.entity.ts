import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

@Entity('events')
export class Event extends BaseEntity {
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'start_time', type: 'timestamp' }) @Index() startTime: Date;
  @Column({ name: 'end_time', type: 'timestamp' }) endTime: Date;
  @Column({ name: 'all_day', default: false }) allDay: boolean;
  @Column({ nullable: true }) location: string;
  @Column('simple-array', { nullable: true }) attendees: string[];
  @Column({ name: 'related_entity_type', type: 'varchar', nullable: true }) relatedEntityType: string | null;
  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true }) relatedEntityId: string | null;
  @Column({ name: 'created_by' }) createdBy: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'created_by' }) creator: User;
}
