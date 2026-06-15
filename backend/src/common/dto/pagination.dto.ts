import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PaginatedResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedResponse<T> {
  data: T[];
  meta: PaginatedResponseMeta;

  constructor(data: T[], total: number, paginationDto: PaginationDto) {
    this.data = data;
    this.meta = {
      page: paginationDto.page,
      limit: paginationDto.limit,
      total,
      totalPages: Math.ceil(total / paginationDto.limit),
    };
  }
}
