import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './entities';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class OpportunitiesService {
  constructor(@InjectRepository(Opportunity) private repo: Repository<Opportunity>) {}

  async create(dto: CreateOpportunityDto, userId: string): Promise<Opportunity> {
    return this.repo.save(this.repo.create({ ...dto, createdBy: userId }));
  }

  async findAll(p: PaginationDto, user: { id: string; role: UserRole }): Promise<PaginatedResponse<Opportunity>> {
    const qb = this.repo.createQueryBuilder('opp')
      .leftJoinAndSelect('opp.contact', 'contact')
      .leftJoinAndSelect('opp.lead', 'lead');
    if (user.role !== UserRole.ADMIN) {
      qb.where('(opp.created_by = :uid OR opp.assigned_to = :uid)', { uid: user.id });
    }
    if (p.search) qb.andWhere('opp.title ILIKE :s', { s: `%${p.search}%` });
    qb.orderBy(`opp.${p.sortBy || 'created_at'}`, p.sortOrder || 'DESC').skip(p.skip).take(p.limit);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponse(data, total, p);
  }

  async findOne(id: string): Promise<Opportunity> {
    const opp = await this.repo.findOne({ where: { id }, relations: ['contact', 'lead'] });
    if (!opp) throw new NotFoundException(`Opportunity ${id} not found`);
    return opp;
  }

  async update(id: string, dto: UpdateOpportunityDto, user: { id: string; role: UserRole }): Promise<Opportunity> {
    const opp = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && opp.createdBy !== user.id && opp.assignedTo !== user.id)
      throw new ForbiddenException();
    Object.assign(opp, dto);
    return this.repo.save(opp);
  }

  async remove(id: string, user: { id: string; role: UserRole }): Promise<void> {
    const opp = await this.findOne(id);
    if (user.role !== UserRole.ADMIN && opp.createdBy !== user.id) throw new ForbiddenException();
    await this.repo.softRemove(opp);
  }
}
