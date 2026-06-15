import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsArray, IsDateString, IsUUID } from 'class-validator';

export class CreateEventDto {
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsDateString() startTime: string;
  @ApiProperty() @IsDateString() endTime: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allDay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) attendees?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() relatedEntityType?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() relatedEntityId?: string;
}
export class UpdateEventDto extends PartialType(CreateEventDto) {}
