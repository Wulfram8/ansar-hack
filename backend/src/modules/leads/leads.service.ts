import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities';
import { CreateLeadDto, UpdateLeadDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepo: Repository<Lead>,
  ) {}

  async create(dto: CreateLeadDto, userId: string): Promise<Lead> {
    const lead = this.leadsRepo.create({ ...dto, createdBy: userId });
    return this.leadsRepo.save(lead);
  }

  async findAll(pagination: PaginationDto, user: { id: string; role: UserRole }): Promise<PaginatedResponse<Lead>> {
    const qb = this.leadsRepo.createQueryBuilder('lead').leftJoinAndSelect('lead.contact', 'contact');

    if (user.role !== UserRole.ADMIN) {
      qb.where('(lead.created_by = :userId OR lead.assigned_to = :userId)', { userId: user.id });
    }

    if (pagination.search) {
      qb.andWhere('(lead.title ILIKE :s)', { s: `%${pagination.search}%` });
    }

    qb.orderBy(`lead.${pagination.sortBy || 'created_at'}`, pagination.sortOrder || 'DESC')
      .skip(pagination.skip).take(pagination.limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponse(data, total, pagination);
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepo.findOne({ where: { id }, relations: ['contact'] });
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, user: { id: string; role: UserRole }): Promise<Lead> {
    const lead = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && lead.createdBy !== user.id && lead.assignedTo !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(lead, dto);
    return this.leadsRepo.save(lead);
  }

  async remove(id: string, user: { id: string; role: UserRole }): Promise<void> {
    const lead = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && lead.createdBy !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    await this.leadsRepo.softRemove(lead);
  }
}
