import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

@Entity('dashboard_widgets')
export class DashboardWidget extends BaseEntity {
  @Column({ name: 'user_id' }) @Index() userId: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;

  @Column({ name: 'widget_type' }) widgetType: string; // 'chart', 'stat', 'table', 'list'
  @Column() title: string;

  @Column({ type: 'jsonb', default: {} })
  config: {
    entityType?: string;       // Which entity to query
    chartType?: string;        // 'bar', 'line', 'pie', 'area', 'donut'
    groupBy?: string;          // Field to group by
    aggregation?: string;      // 'count', 'sum', 'avg'
    aggregationField?: string; // Field to aggregate
    filters?: Record<string, any>[];
    dateRange?: string;        // 'today', 'week', 'month', 'quarter', 'year'
    limit?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: { x: 0, y: 0 } })
  position: { x: number; y: number };

  @Column({ type: 'jsonb', default: { w: 4, h: 3 } })
  size: { w: number; h: number };
}
