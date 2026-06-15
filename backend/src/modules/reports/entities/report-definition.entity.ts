import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

@Entity('report_definitions')
export class ReportDefinition extends BaseEntity {
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'entity_type' }) entityType: string; // 'contacts', 'leads', 'opportunities', etc.
  @Column({ type: 'jsonb', default: [] }) filters: Record<string, any>[];
  @Column('simple-array', { nullable: true }) columns: string[];
  @Column({ name: 'group_by', nullable: true }) groupBy: string;
  @Column({ name: 'sort_by', nullable: true }) sortBy: string;
  @Column({ name: 'chart_type', nullable: true }) chartType: string; // 'bar', 'line', 'pie', 'area', 'table'
  @Column({ name: 'created_by' }) createdBy: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'created_by' }) creator: User;
}
