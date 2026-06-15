import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, IsUUID, IsDateString, IsInt, Min, Max } from 'class-validator';
import { OpportunityStage } from '../entities/opportunity.entity';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Enterprise License Deal' }) @IsString() @IsNotEmpty() title: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() contactId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() leadId?: string;
  @ApiPropertyOptional({ enum: OpportunityStage }) @IsOptional() @IsEnum(OpportunityStage) stage?: OpportunityStage;
  @ApiPropertyOptional({ example: 100000 }) @IsOptional() @IsNumber() value?: number;
  @ApiPropertyOptional({ example: 75 }) @IsOptional() @IsInt() @Min(0) @Max(100) probability?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedCloseDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() customFields?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedTo?: string;
}

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {}
