import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities';
import { CreateContactDto, UpdateContactDto } from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepo: Repository<Contact>,
  ) {}

  async create(dto: CreateContactDto, userId: string): Promise<Contact> {
    const contact = this.contactsRepo.create({
      ...dto,
      createdBy: userId,
    });
    return this.contactsRepo.save(contact);
  }

  async findAll(
    paginationDto: PaginationDto,
    user: { id: string; role: UserRole },
  ): Promise<PaginatedResponse<Contact>> {
    const qb = this.contactsRepo.createQueryBuilder('contact');

    if (user.role === UserRole.EMPLOYEE) {
      qb.where('(contact.created_by = :userId OR contact.assigned_to = :userId)', { userId: user.id });
    } else if (user.role === UserRole.MANAGER) {
      qb.where('(contact.created_by = :userId OR contact.assigned_to = :userId)', { userId: user.id });
    }

    if (paginationDto.search) {
      qb.andWhere(
        '(contact.first_name ILIKE :s OR contact.last_name ILIKE :s OR contact.email ILIKE :s OR contact.company ILIKE :s)',
        { s: `%${paginationDto.search}%` },
      );
    }

    qb.orderBy(`contact.${paginationDto.sortBy || 'created_at'}`, paginationDto.sortOrder || 'DESC')
      .skip(paginationDto.skip)
      .take(paginationDto.limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponse(data, total, paginationDto);
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactsRepo.findOne({ where: { id } });
    if (!contact) throw new NotFoundException(`Contact ${id} not found`);
    return contact;
  }

  async update(id: string, dto: UpdateContactDto, user: { id: string; role: UserRole }): Promise<Contact> {
    const contact = await this.findOne(id);
    this.checkAccess(contact, user);
    Object.assign(contact, dto);
    return this.contactsRepo.save(contact);
  }

  async remove(id: string, user: { id: string; role: UserRole }): Promise<void> {
    const contact = await this.findOne(id);
    this.checkAccess(contact, user);
    await this.contactsRepo.softRemove(contact);
  }

  private checkAccess(contact: Contact, user: { id: string; role: UserRole }): void {
    if (user.role === UserRole.ADMIN) return;
    if (contact.createdBy !== user.id && contact.assignedTo !== user.id) {
      throw new ForbiddenException('Access denied');
    }
  }
}
