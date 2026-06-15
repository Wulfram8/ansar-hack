import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Event } from './entities';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class CalendarService {
  constructor(@InjectRepository(Event) private repo: Repository<Event>) {}

  async create(dto: CreateEventDto, userId: string): Promise<Event> {
    return this.repo.save(this.repo.create({ ...dto, createdBy: userId }));
  }

  async findAll(userId: string, startDate?: string, endDate?: string): Promise<Event[]> {
    const qb = this.repo.createQueryBuilder('event')
      .where('(event.created_by = :userId OR :userId = ANY(string_to_array(event.attendees, \',\')))', { userId });

    if (startDate && endDate) {
      qb.andWhere('event.start_time BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return qb.orderBy('event.start_time', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, dto);
    return this.repo.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.repo.remove(event);
  }
}
