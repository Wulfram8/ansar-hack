import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchemaService } from './schema.service';
import {
  CreateEntitySchemaDto,
  UpdateEntitySchemaDto,
  CreateFieldSchemaDto,
  UpdateFieldSchemaDto,
  CreateEntityRecordDto,
  UpdateEntityRecordDto,
} from './dto';
import { PaginationDto } from '../../common/dto';
import { Auth, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';

@ApiTags('Schemas')
@Controller('schemas')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create entity schema (Admin only)' })
  @ApiResponse({ status: 201, description: 'Schema created' })
  create(@Body() dto: CreateEntitySchemaDto, @CurrentUser('id') userId: string) {
    return this.schemaService.createEntitySchema(dto, userId);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all entity schemas' })
  findAll() {
    return this.schemaService.findAllSchemas();
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get entity schema by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schemaService.findSchemaById(id);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update entity schema (Admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEntitySchemaDto,
  ) {
    return this.schemaService.updateEntitySchema(id, dto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete entity schema (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.schemaService.deleteEntitySchema(id);
  }

  // Field management
  @Post(':id/fields')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add field to schema' })
  addField(
    @Param('id', ParseUUIDPipe) schemaId: string,
    @Body() dto: CreateFieldSchemaDto,
  ) {
    return this.schemaService.addField(schemaId, dto);
  }

  @Patch(':id/fields/:fieldId')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update field in schema' })
  updateField(
    @Param('id', ParseUUIDPipe) schemaId: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
    @Body() dto: UpdateFieldSchemaDto,
  ) {
    return this.schemaService.updateField(schemaId, fieldId, dto);
  }

  @Delete(':id/fields/:fieldId')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove field from schema' })
  removeField(
    @Param('id', ParseUUIDPipe) schemaId: string,
    @Param('fieldId', ParseUUIDPipe) fieldId: string,
  ) {
    return this.schemaService.removeField(schemaId, fieldId);
  }
}

@ApiTags('Records')
@Controller('records')
export class RecordsController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post(':schemaSlug')
  @Auth()
  @ApiOperation({ summary: 'Create a record for an entity' })
  create(
    @Param('schemaSlug') schemaSlug: string,
    @Body() dto: CreateEntityRecordDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.schemaService.createRecord(schemaSlug, dto, userId);
  }

  @Get(':schemaSlug')
  @Auth()
  @ApiOperation({ summary: 'List records for an entity' })
  findAll(
    @Param('schemaSlug') schemaSlug: string,
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: any,
  ) {
    return this.schemaService.findAllRecords(schemaSlug, paginationDto, user);
  }

  @Get(':schemaSlug/:id')
  @Auth()
  @ApiOperation({ summary: 'Get a specific record' })
  findOne(
    @Param('schemaSlug') schemaSlug: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.schemaService.findRecord(schemaSlug, id);
  }

  @Patch(':schemaSlug/:id')
  @Auth()
  @ApiOperation({ summary: 'Update a record' })
  update(
    @Param('schemaSlug') schemaSlug: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEntityRecordDto,
    @CurrentUser() user: any,
  ) {
    return this.schemaService.updateRecord(schemaSlug, id, dto, user);
  }

  @Delete(':schemaSlug/:id')
  @Auth()
  @ApiOperation({ summary: 'Delete a record' })
  remove(
    @Param('schemaSlug') schemaSlug: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.schemaService.deleteRecord(schemaSlug, id, user);
  }
}
