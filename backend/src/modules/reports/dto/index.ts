import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'Monthly Lead Report' }) @IsString() @IsNotEmpty() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 'leads' }) @IsString() @IsNotEmpty() entityType: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() filters?: Record<string, any>[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) columns?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() groupBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sortBy?: string;
  @ApiPropertyOptional({ example: 'bar' }) @IsOptional() @IsString() chartType?: string;
}
export class UpdateReportDto extends PartialType(CreateReportDto) {}
