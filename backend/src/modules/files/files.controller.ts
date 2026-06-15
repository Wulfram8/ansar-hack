import {
  Controller, Get, Post, Delete, Param, Query, Res,
  ParseUUIDPipe, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { PaginationDto } from '../../common/dto';
import { Auth, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly svc: FilesService) {}

  @Post('upload')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({ schema: { type: 'object', properties: {
    file: { type: 'string', format: 'binary' },
    relatedEntityType: { type: 'string' },
    relatedEntityId: { type: 'string' },
  }}})
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @Query('relatedEntityType') entityType?: string,
    @Query('relatedEntityId') entityId?: string,
  ) {
    return this.svc.upload(file, userId, entityType, entityId);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List files' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  findAll(
    @Query() p: PaginationDto,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.svc.findAll(p, entityType, entityId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Download a file' })
  async download(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const file = await this.svc.findOne(id);
    res.download(this.svc.getFilePath(file), file.originalName);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a file (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.svc.remove(id); }
}
