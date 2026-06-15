import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntitySchema, FieldSchema, EntityRecord } from './entities';
import {
  CreateEntitySchemaDto,
  UpdateEntitySchemaDto,
  CreateFieldSchemaDto,
  UpdateFieldSchemaDto,
  CreateEntityRecordDto,
  UpdateEntityRecordDto,
} from './dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class SchemaService {
  constructor(
    @InjectRepository(EntitySchema)
    private entitySchemaRepo: Repository<EntitySchema>,
    @InjectRepository(FieldSchema)
    private fieldSchemaRepo: Repository<FieldSchema>,
    @InjectRepository(EntityRecord)
    private entityRecordRepo: Repository<EntityRecord>,
  ) {}

  // ─── Entity Schema CRUD ───────────────────────────────────────

  async createEntitySchema(dto: CreateEntitySchemaDto, userId: string): Promise<EntitySchema> {
    const existing = await this.entitySchemaRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException(`Entity schema with slug "${dto.slug}" already exists`);
    }

    const schema = this.entitySchemaRepo.create({
      ...dto,
      createdBy: userId,
      fields: dto.fields?.map((f, i) => ({
        ...f,
        displayOrder: f.displayOrder ?? i,
      })),
    });

    return this.entitySchemaRepo.save(schema);
  }

  async findAllSchemas(): Promise<EntitySchema[]> {
    return this.entitySchemaRepo.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findSchemaById(id: string): Promise<EntitySchema> {
    const schema = await this.entitySchemaRepo.findOne({
      where: { id },
      relations: ['fields'],
    });
    if (!schema) {
      throw new NotFoundException(`Entity schema with ID ${id} not found`);
    }
    return schema;
  }

  async findSchemaBySlug(slug: string): Promise<EntitySchema> {
    const schema = await this.entitySchemaRepo.findOne({
      where: { slug },
      relations: ['fields'],
    });
    if (!schema) {
      throw new NotFoundException(`Entity schema "${slug}" not found`);
    }
    return schema;
  }

  async updateEntitySchema(id: string, dto: UpdateEntitySchemaDto): Promise<EntitySchema> {
    const schema = await this.findSchemaById(id);
    Object.assign(schema, dto);
    return this.entitySchemaRepo.save(schema);
  }

  async deleteEntitySchema(id: string): Promise<void> {
    const schema = await this.findSchemaById(id);
    if (schema.isSystem) {
      throw new BadRequestException('Cannot delete system entity schemas');
    }
    await this.entitySchemaRepo.remove(schema);
  }

  // ─── Field Schema CRUD ────────────────────────────────────────

  async addField(schemaId: string, dto: CreateFieldSchemaDto): Promise<FieldSchema> {
    const schema = await this.findSchemaById(schemaId);

    const existingField = schema.fields?.find((f) => f.slug === dto.slug);
    if (existingField) {
      throw new BadRequestException(`Field with slug "${dto.slug}" already exists in this schema`);
    }

    const field = this.fieldSchemaRepo.create({
      ...dto,
      entitySchemaId: schemaId,
    });

    return this.fieldSchemaRepo.save(field);
  }

  async updateField(schemaId: string, fieldId: string, dto: UpdateFieldSchemaDto): Promise<FieldSchema> {
    const field = await this.fieldSchemaRepo.findOne({
      where: { id: fieldId, entitySchemaId: schemaId },
    });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    Object.assign(field, dto);
    return this.fieldSchemaRepo.save(field);
  }

  async removeField(schemaId: string, fieldId: string): Promise<void> {
    const field = await this.fieldSchemaRepo.findOne({
      where: { id: fieldId, entitySchemaId: schemaId },
    });
    if (!field) {
      throw new NotFoundException('Field not found');
    }
    await this.fieldSchemaRepo.remove(field);
  }

  // ─── Entity Record CRUD ───────────────────────────────────────

  async createRecord(
    schemaSlug: string,
    dto: CreateEntityRecordDto,
    userId: string,
  ): Promise<EntityRecord> {
    const schema = await this.findSchemaBySlug(schemaSlug);
    this.validateRecordData(schema, dto.data);

    const record = this.entityRecordRepo.create({
      entitySchemaId: schema.id,
      data: dto.data,
      createdBy: userId,
      assignedTo: dto.assignedTo || null,
    });

    return this.entityRecordRepo.save(record);
  }

  async findAllRecords(
    schemaSlug: string,
    paginationDto: PaginationDto,
    user: { id: string; role: UserRole },
  ): Promise<PaginatedResponse<EntityRecord>> {
    const schema = await this.findSchemaBySlug(schemaSlug);

    const queryBuilder = this.entityRecordRepo
      .createQueryBuilder('record')
      .where('record.entity_schema_id = :schemaId', { schemaId: schema.id });

    // Apply RBAC filtering
    if (user.role === UserRole.EMPLOYEE) {
      queryBuilder.andWhere(
        '(record.created_by = :userId OR record.assigned_to = :userId)',
        { userId: user.id },
      );
    } else if (user.role === UserRole.MANAGER) {
      // Managers can see records they created or are assigned to
      queryBuilder.andWhere(
        '(record.created_by = :userId OR record.assigned_to = :userId)',
        { userId: user.id },
      );
    }
    // Admin sees all

    if (paginationDto.search) {
      queryBuilder.andWhere("record.data::text ILIKE :search", {
        search: `%${paginationDto.search}%`,
      });
    }

    queryBuilder
      .orderBy('record.created_at', paginationDto.sortOrder || 'DESC')
      .skip(paginationDto.skip)
      .take(paginationDto.limit);

    const [records, total] = await queryBuilder.getManyAndCount();
    return new PaginatedResponse(records, total, paginationDto);
  }

  async findRecord(schemaSlug: string, id: string): Promise<EntityRecord> {
    const schema = await this.findSchemaBySlug(schemaSlug);
    const record = await this.entityRecordRepo.findOne({
      where: { id, entitySchemaId: schema.id },
    });
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    return record;
  }

  async updateRecord(
    schemaSlug: string,
    id: string,
    dto: UpdateEntityRecordDto,
    user: { id: string; role: UserRole },
  ): Promise<EntityRecord> {
    const record = await this.findRecord(schemaSlug, id);
    this.checkOwnership(record, user);

    if (dto.data) {
      const schema = await this.findSchemaBySlug(schemaSlug);
      this.validateRecordData(schema, dto.data);
      record.data = { ...record.data, ...dto.data };
    }

    if (dto.assignedTo !== undefined) {
      record.assignedTo = dto.assignedTo;
    }

    return this.entityRecordRepo.save(record);
  }

  async deleteRecord(
    schemaSlug: string,
    id: string,
    user: { id: string; role: UserRole },
  ): Promise<void> {
    const record = await this.findRecord(schemaSlug, id);
    this.checkOwnership(record, user);
    await this.entityRecordRepo.remove(record);
  }

  // ─── Helpers ──────────────────────────────────────────────────

  private validateRecordData(schema: EntitySchema, data: Record<string, any>): void {
    if (!schema.fields) return;

    for (const field of schema.fields) {
      if (field.isRequired && (data[field.slug] === undefined || data[field.slug] === null)) {
        throw new BadRequestException(`Field "${field.name}" is required`);
      }
    }
  }

  private checkOwnership(record: EntityRecord, user: { id: string; role: UserRole }): void {
    if (user.role === UserRole.ADMIN) return;

    if (record.createdBy !== user.id && record.assignedTo !== user.id) {
      throw new ForbiddenException('You do not have permission to modify this record');
    }
  }
}
