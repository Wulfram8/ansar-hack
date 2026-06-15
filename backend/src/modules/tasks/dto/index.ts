import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject, IsUUID, IsDateString } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: TaskStatus }) @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @ApiPropertyOptional({ enum: TaskPriority }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedEntityType?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() relatedEntityId?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() customFields?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assignedTo?: string;
}
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
