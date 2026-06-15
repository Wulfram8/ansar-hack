import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  async create(dto: CreateTaskDto, userId: string): Promise<Task> {
    return this.repo.save(this.repo.create({ ...dto, createdBy: userId }));
  }

  async findAll(p: PaginationDto, user: { id: string; role: UserRole }): Promise<PaginatedResponse<Task>> {
    const qb = this.repo.createQueryBuilder('task');
    if (user.role !== UserRole.ADMIN) {
      qb.where('(task.created_by = :uid OR task.assigned_to = :uid)', { uid: user.id });
    }
    if (p.search) qb.andWhere('task.title ILIKE :s', { s: `%${p.search}%` });
    qb.orderBy(`task.${p.sortBy || 'created_at'}`, p.sortOrder || 'DESC').skip(p.skip).take(p.limit);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponse(data, total, p);
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: { id: string; role: UserRole }): Promise<Task> {
    const task = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && task.createdBy !== user.id && task.assignedTo !== user.id) throw new ForbiddenException();

    if (dto.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      task.completedAt = new Date();
    }

    Object.assign(task, dto);
    return this.repo.save(task);
  }

  async remove(id: string, user: { id: string; role: UserRole }): Promise<void> {
    const task = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && task.createdBy !== user.id) throw new ForbiddenException();
    await this.repo.remove(task);
  }
}
