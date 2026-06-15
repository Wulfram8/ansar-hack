import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  ValidateNested,
  IsArray,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../entities/field-schema.entity';

export class CreateFieldSchemaDto {
  @ApiProperty({ example: 'Company Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'company_name' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ enum: FieldType, example: FieldType.TEXT })
  @IsEnum(FieldType)
  fieldType: FieldType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional({
    description: 'Field-specific options (e.g., select choices, relation target)',
    example: { choices: ['Option A', 'Option B'] },
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class CreateEntitySchemaDto {
  @ApiProperty({ example: 'Projects' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'projects' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Track your projects' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'folder' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: [CreateFieldSchemaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldSchemaDto)
  fields?: CreateFieldSchemaDto[];
}

export class UpdateEntitySchemaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;
}

export class UpdateFieldSchemaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: FieldType })
  @IsOptional()
  @IsEnum(FieldType)
  fieldType?: FieldType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

export class CreateEntityRecordDto {
  @ApiProperty({ description: 'Dynamic field values', example: { company_name: 'Acme Corp' } })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'Assign to user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class UpdateEntityRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
