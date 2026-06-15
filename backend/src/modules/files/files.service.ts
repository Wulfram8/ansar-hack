import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { FileEntity } from './entities';
import { PaginationDto, PaginatedResponse } from '../../common/dto';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class FilesService {
  private uploadDir: string;

  constructor(
    @InjectRepository(FileEntity) private repo: Repository<FileEntity>,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('uploadDir') || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
  ): Promise<FileEntity> {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return this.repo.save(this.repo.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      relatedEntityType: relatedEntityType || null,
      relatedEntityId: relatedEntityId || null,
      uploadedBy: userId,
    }));
  }

  async findAll(p: PaginationDto, entityType?: string, entityId?: string): Promise<PaginatedResponse<FileEntity>> {
    const qb = this.repo.createQueryBuilder('file');
    if (entityType) qb.where('file.related_entity_type = :t', { t: entityType });
    if (entityId) qb.andWhere('file.related_entity_id = :eid', { eid: entityId });
    if (p.search) qb.andWhere('file.original_name ILIKE :s', { s: `%${p.search}%` });
    qb.orderBy('file.created_at', 'DESC').skip(p.skip).take(p.limit);
    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponse(data, total, p);
  }

  async findOne(id: string): Promise<FileEntity> {
    const file = await this.repo.findOne({ where: { id } });
    if (!file) throw new NotFoundException(`File ${id} not found`);
    return file;
  }

  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    await this.repo.remove(file);
  }

  getFilePath(file: FileEntity): string {
    return file.path;
  }
}
