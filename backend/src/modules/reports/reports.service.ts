import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReportDefinition } from './entities';
import { CreateReportDto, UpdateReportDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportDefinition) private repo: Repository<ReportDefinition>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateReportDto, userId: string): Promise<ReportDefinition> {
    return this.repo.save(this.repo.create({ ...dto, createdBy: userId }));
  }

  async findAll(userId: string): Promise<ReportDefinition[]> {
    return this.repo.find({
      where: { createdBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ReportDefinition> {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) throw new NotFoundException(`Report ${id} not found`);
    return report;
  }

  async update(id: string, dto: UpdateReportDto): Promise<ReportDefinition> {
    const report = await this.findOne(id);
    Object.assign(report, dto);
    return this.repo.save(report);
  }

  async remove(id: string): Promise<void> {
    const report = await this.findOne(id);
    await this.repo.remove(report);
  }

  async execute(id: string): Promise<any> {
    const report = await this.findOne(id);
    const tableName = report.entityType;

    // Build dynamic query based on report definition
    const allowedTables = ['contacts', 'leads', 'opportunities', 'tasks', 'events', 'emails'];
    if (!allowedTables.includes(tableName)) {
      throw new NotFoundException(`Entity type "${tableName}" is not supported for reports`);
    }

    let query = `SELECT `;

    if (report.groupBy) {
      query += `${report.groupBy}, COUNT(*) as count`;
      if (tableName === 'leads' || tableName === 'opportunities') {
        query += `, COALESCE(SUM(value::numeric), 0) as total_value`;
      }
    } else if (report.columns && report.columns.length > 0) {
      query += report.columns.join(', ');
    } else {
      query += '*';
    }

    query += ` FROM ${tableName}`;

    // Apply filters
    const params: any[] = [];
    if (report.filters && report.filters.length > 0) {
      const conditions = report.filters.map((filter, i) => {
        params.push(filter.value);
        return `${filter.field} ${filter.operator || '='} $${i + 1}`;
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (report.groupBy) {
      query += ` GROUP BY ${report.groupBy}`;
    }

    if (report.sortBy) {
      query += ` ORDER BY ${report.sortBy}`;
    }

    query += ` LIMIT 1000`;

    const results = await this.dataSource.query(query, params);

    return {
      report: {
        id: report.id,
        name: report.name,
        chartType: report.chartType,
        entityType: report.entityType,
      },
      data: results,
      total: results.length,
    };
  }
}
