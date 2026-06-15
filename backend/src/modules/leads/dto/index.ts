import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, IsUUID } from 'class-validator';
import { LeadStatus, LeadPriority } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({ example: 'Enterprise Deal - Acme Corp' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ example: 'Website' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ enum: LeadPriority })
  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}
