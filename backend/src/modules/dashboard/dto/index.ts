import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateWidgetDto {
  @ApiProperty({ example: 'chart' }) @IsString() @IsNotEmpty() widgetType: string;
  @ApiProperty({ example: 'Leads by Status' }) @IsString() @IsNotEmpty() title: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() config?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsObject() position?: { x: number; y: number };
  @ApiPropertyOptional() @IsOptional() @IsObject() size?: { w: number; h: number };
}
export class UpdateWidgetDto extends PartialType(CreateWidgetDto) {}
