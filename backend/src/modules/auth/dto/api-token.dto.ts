import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreateApiTokenDto {
  @ApiProperty({ example: 'My Integration Token' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: ['read:contacts', 'write:contacts'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ApiTokenResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  tokenPrefix: string;

  @ApiProperty()
  scopes: string[];

  @ApiProperty({ nullable: true })
  lastUsedAt: Date | null;

  @ApiProperty({ nullable: true })
  expiresAt: Date | null;

  @ApiProperty()
  createdAt: Date;
}

export class ApiTokenCreatedResponseDto extends ApiTokenResponseDto {
  @ApiProperty({ description: 'The full token. Only shown once at creation time.' })
  token: string;
}
