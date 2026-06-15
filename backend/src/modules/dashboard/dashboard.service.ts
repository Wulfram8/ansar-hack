import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DashboardWidget } from './entities';
import { CreateWidgetDto, UpdateWidgetDto } from './dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DashboardWidget) private repo: Repository<DashboardWidget>,
    private dataSource: DataSource,
  ) {}

  async getWidgets(userId: string): Promise<DashboardWidget[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  async createWidget(dto: CreateWidgetDto, userId: string): Promise<DashboardWidget> {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  async updateWidget(id: string, dto: UpdateWidgetDto, userId: string): Promise<DashboardWidget> {
    const widget = await this.repo.findOne({ where: { id, userId } });
    if (!widget) throw new NotFoundException(`Widget ${id} not found`);
    Object.assign(widget, dto);
    return this.repo.save(widget);
  }

  async removeWidget(id: string, userId: string): Promise<void> {
    const widget = await this.repo.findOne({ where: { id, userId } });
    if (!widget) throw new NotFoundException(`Widget ${id} not found`);
    await this.repo.remove(widget);
  }

  async getWidgetData(widgetId: string, userId: string): Promise<any> {
    const widget = await this.repo.findOne({ where: { id: widgetId, userId } });
    if (!widget) throw new NotFoundException(`Widget ${widgetId} not found`);

    const config = widget.config;
    const entityType = config.entityType || 'contacts';
    const allowedTables = ['contacts', 'leads', 'opportunities', 'tasks', 'events', 'emails'];

    if (!allowedTables.includes(entityType)) {
      return { data: [], labels: [] };
    }

    try {
      if (widget.widgetType === 'stat') {
        return this.getStatData(entityType, config);
      } else if (widget.widgetType === 'chart') {
        return this.getChartData(entityType, config);
      } else if (widget.widgetType === 'list') {
        return this.getListData(entityType, config);
      }
    } catch {
      return { data: [], labels: [] };
    }

    return { data: [], labels: [] };
  }

  private async getStatData(table: string, config: any) {
    const agg = config.aggregation || 'count';
    const field = config.aggregationField || '*';
    let query = '';

    if (agg === 'count') {
      query = `SELECT COUNT(*) as value FROM ${table}`;
    } else if (agg === 'sum') {
      query = `SELECT COALESCE(SUM(${field}::numeric), 0) as value FROM ${table}`;
    } else if (agg === 'avg') {
      query = `SELECT COALESCE(AVG(${field}::numeric), 0) as value FROM ${table}`;
    }

    const result = await this.dataSource.query(query);
    return { value: Number(result[0]?.value || 0) };
  }

  private async getChartData(table: string, config: any) {
    const groupBy = config.groupBy || 'status';
    const agg = config.aggregation || 'count';
    const aggField = config.aggregationField || '*';

    let aggExpr = 'COUNT(*)';
    if (agg === 'sum') aggExpr = `COALESCE(SUM(${aggField}::numeric), 0)`;
    if (agg === 'avg') aggExpr = `COALESCE(AVG(${aggField}::numeric), 0)`;

    const query = `SELECT ${groupBy} as label, ${aggExpr} as value FROM ${table} GROUP BY ${groupBy} ORDER BY value DESC LIMIT ${config.limit || 10}`;
    const results = await this.dataSource.query(query);

    return {
      labels: results.map((r: any) => r.label || 'N/A'),
      data: results.map((r: any) => Number(r.value)),
    };
  }

  private async getListData(table: string, config: any) {
    const limit = config.limit || 5;
    const query = `SELECT * FROM ${table} ORDER BY created_at DESC LIMIT ${limit}`;
    const results = await this.dataSource.query(query);
    return { data: results };
  }
}
