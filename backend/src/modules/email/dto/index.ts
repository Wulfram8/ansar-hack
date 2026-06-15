import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEmailDto {
  @ApiProperty() @IsArray() @IsEmail({}, { each: true }) toAddresses: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsEmail({}, { each: true }) ccAddresses?: string[];
  @ApiProperty() @IsString() @IsNotEmpty() subject: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bodyHtml?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bodyText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedEntityType?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() relatedEntityId?: string;
}
export class UpdateEmailDto extends PartialType(CreateEmailDto) {}
