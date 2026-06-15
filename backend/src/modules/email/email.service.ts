import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email, EmailStatus, EmailDirection } from './entities';
import { CreateEmailDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto';

@Injectable()
export class EmailService {
  constructor(@InjectRepository(Email) private repo: Repository<Email>) {}

  async create(dto: CreateEmailDto, userId: string, userEmail: string): Promise<Email> {
    return this.repo.save(this.repo.create({
      ...dto,
      fromAddress: userEmail,
      status: EmailStatus.DRAFT,
      direction: EmailDirection.OUTBOUND,
      createdBy: userId,
    }));
  }

  async send(id: string): Promise<Email> {
    const email = await this.findOne(id);
    // TODO: Integrate with nodemailer for actual sending
    email.status = EmailStatus.SENT;
    email.sentAt = new Date();
    return this.repo.save(email);
  }

  async findAll(userId: string, p: PaginationDto): Promise<PaginatedResponse<Email>> {
    const qb = this.repo.createQueryBuilder('email')
      .where('email.created_by = :userId', { userId });
    if (p.search) qb.andWhere('(email.subject ILIKE :s OR email.to_addresses ILIKE :s)', { s: `%${p.search}%` });
    qb.orderBy('email.created_at', 'DESC').skip(p.skip).take(p.limit);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponse(data, total, p);
  }

  async findOne(id: string): Promise<Email> {
    const email = await this.repo.findOne({ where: { id } });
    if (!email) throw new NotFoundException(`Email ${id} not found`);
    return email;
  }

  async remove(id: string): Promise<void> {
    const email = await this.findOne(id);
    await this.repo.remove(email);
  }
}
